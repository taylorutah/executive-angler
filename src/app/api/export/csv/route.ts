import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPremium } from '@/lib/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const premium = await checkPremium(supabase, user.id, user.email);
  if (!premium) {
    return NextResponse.json({ error: 'Premium required' }, { status: 403 });
  }

  try {
    // Fetch sessions
    let sessionsQuery = supabase
      .from('fishing_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (from) sessionsQuery = sessionsQuery.gte('date', from);
    if (to) sessionsQuery = sessionsQuery.lte('date', to);

    const { data: sessions, error: sessionsError } = await sessionsQuery;
    if (sessionsError) throw sessionsError;

    // Fetch all catches for these sessions
    const sessionIds = (sessions || []).map((s) => s.id);
    const { data: catches, error: catchesError } = sessionIds.length > 0
      ? await supabase
          .from('catches')
          .select('*, fly_pattern:fly_patterns(name)')
          .in('session_id', sessionIds)
          .order('created_at', { ascending: true })
      : { data: [], error: null };

    if (catchesError) throw catchesError;

    // Build CSV — one row per catch, with session context
    const headers = [
      'Date',
      'Title',
      'River',
      'Location',
      'Water Temp (°F)',
      'Weather',
      'Clarity',
      'Flow',
      'Species',
      'Length (in)',
      'Fly Pattern',
      'Fly Size',
      'Fly Position',
      'Bead Size',
      'Quantities',
      'Notes',
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const catchesBySession = new Map<string, any[]>();
    (catches || []).forEach((c: any) => {
      if (!catchesBySession.has(c.session_id)) catchesBySession.set(c.session_id, []);
      catchesBySession.get(c.session_id)!.push(c);
    });

    const rows: string[][] = [];

    for (const session of sessions || []) {
      const sessionCatches = catchesBySession.get(session.id) || [];
      const sessionBase = [
        session.date || '',
        session.title || '',
        session.river_name || '',
        session.location || session.section || '',
        session.water_temp_f?.toString() || '',
        session.weather || '',
        session.water_clarity || '',
        session.river_flow_cfs?.toString() || '',
      ];

      if (sessionCatches.length === 0) {
        // Session with no individual catches — one row with empty catch columns
        rows.push([...sessionBase, '', '', '', '', '', '', '', session.notes || '']);
      } else {
        for (const c of sessionCatches) {
          const flyName = c.fly_pattern?.name || c.fly_name || '';
          rows.push([
            ...sessionBase,
            c.species || '',
            c.length_inches?.toString() || '',
            flyName,
            c.fly_size || '',
            c.fly_position || '',
            c.bead_size || '',
            c.quantities?.toString() || '1',
            session.notes || '',
          ]);
        }
      }
    }

    // Escape CSV values
    const escapeCsv = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csvContent = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\n');

    const filename = from && to
      ? `executive-angler-export-${from}-to-${to}.csv`
      : 'executive-angler-export.csv';

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
