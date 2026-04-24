import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { COLUMNS, HEADERS, formatForExport } from '@/lib/import/csv-schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>;

function escapeCsv(val: string): string {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

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
    let sessionsQuery = supabase
      .from('fishing_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (from) sessionsQuery = sessionsQuery.gte('date', from);
    if (to) sessionsQuery = sessionsQuery.lte('date', to);

    const { data: sessions, error: sessionsError } = await sessionsQuery;
    if (sessionsError) throw sessionsError;

    const sessionIds = (sessions || []).map((s: AnyRec) => s.id);
    const { data: catches, error: catchesError } = sessionIds.length > 0
      ? await supabase
          .from('catches')
          .select('*, fly_pattern:fly_patterns(name)')
          .in('session_id', sessionIds)
          .order('created_at', { ascending: true })
      : { data: [], error: null };

    if (catchesError) throw catchesError;

    const catchesBySession = new Map<string, AnyRec[]>();
    (catches || []).forEach((c: AnyRec) => {
      if (!catchesBySession.has(c.session_id)) catchesBySession.set(c.session_id, []);
      catchesBySession.get(c.session_id)!.push(c);
    });

    // Build value lookup per column key, one row per catch (or empty catch row).
    const rows: string[][] = [];

    for (const session of (sessions || []) as AnyRec[]) {
      const sessionCatches = catchesBySession.get(session.id) || [];
      const sessionValues = buildSessionValues(session);

      if (sessionCatches.length === 0) {
        rows.push(rowToCells(sessionValues, buildCatchValues(null)));
      } else {
        for (const c of sessionCatches) {
          rows.push(rowToCells(sessionValues, buildCatchValues(c)));
        }
      }
    }

    // UTF-8 BOM so Excel opens the file with correct encoding
    const csvContent = '\uFEFF' + [
      HEADERS.map(escapeCsv).join(','),
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

function buildSessionValues(session: AnyRec): Record<string, unknown> {
  return {
    session_date: session.date,
    session_title: session.title,
    river_name: session.river_name,
    location: session.location,
    section: session.section,
    session_notes: session.notes,
    weather: session.weather,
    water_temp_f: session.water_temp_f,
    water_clarity: session.water_clarity,
    river_flow_cfs: session.river_flow_cfs,
    session_tags: session.tags,
    trip_tags: session.trip_tags,
    privacy: session.privacy,
    latitude: session.latitude,
    longitude: session.longitude,
  };
}

function buildCatchValues(c: AnyRec | null): Record<string, unknown> {
  if (!c) {
    return {
      species: null,
      length_inches: null,
      fly_pattern_name: null,
      fly_size: null,
      fly_position: null,
      bead_size: null,
      quantities: null,
      catch_notes: null,
      catch_tags: null,
      time_caught: null,
      catch_latitude: null,
      catch_longitude: null,
    };
  }
  return {
    species: c.species,
    length_inches: c.length_inches,
    fly_pattern_name: c.fly_pattern?.name || c.fly_name || null,
    fly_size: c.fly_size,
    fly_position: c.fly_position,
    bead_size: c.bead_size,
    quantities: c.quantities,
    catch_notes: c.catch_note ?? c.notes,
    catch_tags: c.catch_tags,
    time_caught: c.time_caught ?? c.time,
    catch_latitude: c.latitude,
    catch_longitude: c.longitude,
  };
}

function rowToCells(
  sessionValues: Record<string, unknown>,
  catchValues: Record<string, unknown>
): string[] {
  const merged = { ...sessionValues, ...catchValues };
  return COLUMNS.map((col) => formatForExport(merged[col.key], col));
}
