import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { RIVER_AWARDS } from '@/types/awards';
import type { RiverStats, UserAward } from '@/types/awards';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const riverName = searchParams.get('river');

  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all sessions for this user
    const { data: sessions, error: sessionsError } = await supabase
      .from('fishing_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (sessionsError) throw sessionsError;

    // Get all catches for this user
    const { data: catches, error: catchesError } = await supabase
      .from('catches')
      .select('*')
      .eq('user_id', user.id);

    if (catchesError) throw catchesError;

    // Group sessions by river
    const riverMap = new Map<string, any[]>();
    sessions?.forEach((session) => {
      const river = session.river_name || 'Unknown';
      if (!riverMap.has(river)) {
        riverMap.set(river, []);
      }
      riverMap.get(river)?.push(session);
    });

    // Calculate stats for each river
    const riverStats: RiverStats[] = [];

    for (const [river, riverSessions] of riverMap.entries()) {
      // Filter catches for this river
      const sessionIds = riverSessions.map((s) => s.id);
      const riverCatches = catches?.filter((c) => sessionIds.includes(c.session_id)) || [];

      // Calculate species
      const speciesSet = new Set<string>();
      riverCatches.forEach((c) => {
        if (c.species) speciesSet.add(c.species);
      });

      // Calculate biggest fish
      const biggestFish = riverCatches.reduce((max, c) => {
        return (c.length_inches || 0) > max ? c.length_inches || 0 : max;
      }, 0);

      // Calculate favorite fly (most used)
      const flyCount = new Map<string, number>();
      riverCatches.forEach((c) => {
        if (c.fly_name) {
          flyCount.set(c.fly_name, (flyCount.get(c.fly_name) || 0) + 1);
        }
      });
      const favoriteFly = Array.from(flyCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];

      // Calculate total fish
      const totalFish = riverSessions.reduce((sum, s) => sum + (s.total_fish || 0), 0);

      // Calculate best session
      const bestSessionFishCount = riverSessions.reduce(
        (max, s) => Math.max(max, s.total_fish || 0),
        0
      );

      const stats: RiverStats = {
        river_name: river,
        river_id: riverSessions[0]?.river_id,
        total_sessions: riverSessions.length,
        total_fish: totalFish,
        biggest_fish: biggestFish > 0 ? biggestFish : undefined,
        favorite_fly: favoriteFly,
        first_session: riverSessions[riverSessions.length - 1]?.date,
        last_session: riverSessions[0]?.date,
        species_caught: Array.from(speciesSet),
        avg_fish_per_session: totalFish / riverSessions.length,
        best_session_fish_count: bestSessionFishCount,
        awards: [],
      };

      riverStats.push(stats);
    }

    // If specific river requested, return just that one
    if (riverName) {
      const targetStats = riverStats.find(
        (s) => s.river_name.toLowerCase() === riverName.toLowerCase()
      );
      if (!targetStats) {
        return NextResponse.json({ error: 'River not found' }, { status: 404 });
      }

      // Check and award achievements for this river
      await checkAndAwardAchievements(supabase, user.id, targetStats);

      // Fetch awarded achievements
      const { data: awards } = await supabase
        .from('user_awards')
        .select('*')
        .eq('user_id', user.id)
        .eq('river_name', targetStats.river_name);

      targetStats.awards = awards || [];

      return NextResponse.json(targetStats);
    }

    // Return all river stats sorted by total sessions
    const sortedStats = riverStats.sort((a, b) => b.total_sessions - a.total_sessions);

    // Check and award achievements for all rivers
    for (const stats of sortedStats) {
      await checkAndAwardAchievements(supabase, user.id, stats);

      // Fetch awards for this river
      const { data: awards } = await supabase
        .from('user_awards')
        .select('*')
        .eq('user_id', user.id)
        .eq('river_name', stats.river_name);

      stats.awards = awards || [];
    }

    return NextResponse.json(sortedStats);
  } catch (error) {
    console.error('Error calculating river stats:', error);
    return NextResponse.json({ error: 'Failed to calculate stats' }, { status: 500 });
  }
}

async function checkAndAwardAchievements(
  supabase: any,
  userId: string,
  stats: RiverStats
): Promise<void> {
  // Get existing awards for this user and river
  const { data: existingAwards } = await supabase
    .from('user_awards')
    .select('award_key')
    .eq('user_id', userId)
    .eq('river_name', stats.river_name);

  const existingKeys = new Set(existingAwards?.map((a: any) => a.award_key) || []);

  // Check each award definition
  for (const award of RIVER_AWARDS) {
    // Skip if already awarded
    if (existingKeys.has(award.key)) continue;

    // Check if user qualifies
    if (award.check(stats)) {
      // Award it!
      const newAward: Partial<UserAward> = {
        user_id: userId,
        award_type: award.type,
        award_key: award.key,
        river_name: stats.river_name,
        river_id: stats.river_id,
        metadata: {
          badge_icon: award.icon,
          badge_color: award.color,
          display_name: award.display_name,
          description: award.description,
          value: stats.total_sessions >= award.threshold ? stats.total_sessions : stats.total_fish,
        },
      };

      await supabase.from('user_awards').insert(newAward);
    }
  }
}
