import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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
          .select('*')
          .in('session_id', sessionIds)
          .order('created_at', { ascending: true })
      : { data: [], error: null };

    if (catchesError) throw catchesError;

    // Build CSV — one row per catch, with session context
    const headers = [
      'Date',
      'River',
      'Section',
      'Session Title',
      'Weather',
      'Water Temp (F)',
      'Water Clarity',
      'Session Total Fish',
      'Species',
      'Length (in)',
      'Fly Name',
      'Fly Size',
      'Fly Position',
      'Time Caught',
      'Catch Notes',
      'Session Notes',
      'Tags',
      'Latitude',
      'Longitude',
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

      if (sessionCatches.length === 0) {
        // Session with no individual catches — still include it
        rows.push([
          session.date || '',
          session.river_name || '',
          session.section || '',
          session.title || '',
          session.weather || '',
          session.water_temp_f?.toString() || '',
          session.water_clarity || '',
          session.total_fish?.toString() || '0',
          '', '', '', '', '', '', '',
          session.notes || '',
          (session.tags || []).join('; '),
          session.latitude?.toString() || '',
          session.longitude?.toString() || '',
        ]);
      } else {
        for (const c of sessionCatches) {
          rows.push([
            session.date || '',
            session.river_name || '',
            session.section || '',
            session.title || '',
            session.weather || '',
            session.water_temp_f?.toString() || '',
            session.water_clarity || '',
            session.total_fish?.toString() || '0',
            c.species || '',
            c.length_inches?.toString() || '',
            c.fly_name || '',
            c.fly_size || '',
            c.fly_position || '',
            c.time_caught || c.time || '',
            c.catch_note || c.notes || '',
            session.notes || '',
            (session.tags || []).join('; '),
            c.latitude?.toString() || session.latitude?.toString() || '',
            c.longitude?.toString() || session.longitude?.toString() || '',
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
      ? `executive-angler-journal-${from}-to-${to}.csv`
      : `executive-angler-journal-export.csv`;

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
