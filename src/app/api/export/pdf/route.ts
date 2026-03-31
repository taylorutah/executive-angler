import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

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
    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('user_id', user.id)
      .single();

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

    // Fetch catches
    const sessionIds = (sessions || []).map((s) => s.id);
    const { data: catches } = sessionIds.length > 0
      ? await supabase
          .from('catches')
          .select('*')
          .in('session_id', sessionIds)
          .order('created_at', { ascending: true })
      : { data: [] };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const catchesBySession = new Map<string, any[]>();
    (catches || []).forEach((c: any) => {
      if (!catchesBySession.has(c.session_id)) catchesBySession.set(c.session_id, []);
      catchesBySession.get(c.session_id)!.push(c);
    });

    // Build PDF
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (needed: number) => {
      const pageHeight = doc.internal.pageSize.getHeight();
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(13, 17, 23); // Abyss
    doc.text('Fishing Journal', margin, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(139, 148, 158); // Slate
    const anglerName = profile?.display_name || profile?.username || user.email || 'Angler';
    const dateRange = from && to ? `${from} to ${to}` : 'All Sessions';
    doc.text(`${anglerName} — ${dateRange}`, margin, y);
    y += 4;
    doc.text(`Executive Angler — ${new Date().toLocaleDateString()}`, margin, y);
    y += 10;

    // Summary stats
    const totalSessions = (sessions || []).length;
    const totalFish = (sessions || []).reduce((sum, s) => sum + (s.total_fish || 0), 0);
    const totalCatches = (catches || []).length;
    const rivers = new Set((sessions || []).map((s) => s.river_name).filter(Boolean));

    doc.setFillColor(232, 146, 58, 0.1); // Copper Dawn light
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(232, 146, 58); // Copper Dawn
    const statsX = margin + 6;
    doc.text(`${totalSessions} Sessions`, statsX, y + 7);
    doc.text(`${totalFish} Fish`, statsX + 40, y + 7);
    doc.text(`${totalCatches} Catches Logged`, statsX + 72, y + 7);
    doc.text(`${rivers.size} Rivers`, statsX + 120, y + 7);

    if (totalSessions > 0) {
      const avg = (totalFish / totalSessions).toFixed(1);
      doc.text(`${avg} Avg/Session`, statsX, y + 13);
    }
    y += 22;

    // Sessions
    for (const session of sessions || []) {
      checkPageBreak(40);

      // Session header
      doc.setDrawColor(33, 38, 45); // Border color
      doc.setLineWidth(0.3);
      doc.line(margin, y, margin + contentWidth, y);
      y += 6;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(13, 17, 23);
      const sessionTitle = session.title || session.river_name || 'Untitled Session';
      doc.text(sessionTitle, margin, y);
      y += 6;

      // Session meta
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(139, 148, 158);
      const meta: string[] = [];
      if (session.date) meta.push(new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      if (session.river_name && session.river_name !== sessionTitle) meta.push(session.river_name);
      if (session.section) meta.push(session.section);
      if (meta.length > 0) {
        doc.text(meta.join(' — '), margin, y);
        y += 5;
      }

      // Conditions row
      const conditions: string[] = [];
      if (session.weather) conditions.push(session.weather);
      if (session.water_temp_f) conditions.push(`${session.water_temp_f}°F`);
      if (session.water_clarity) conditions.push(session.water_clarity);
      if (conditions.length > 0) {
        doc.text(conditions.join(' | '), margin, y);
        y += 5;
      }

      // Stats
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(13, 17, 23);
      doc.text(`${session.total_fish || 0} fish`, margin, y);
      y += 6;

      // Notes
      if (session.notes) {
        checkPageBreak(15);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(110, 118, 129);
        const noteLines = doc.splitTextToSize(session.notes, contentWidth);
        const maxNoteLines = Math.min(noteLines.length, 4);
        doc.text(noteLines.slice(0, maxNoteLines), margin, y);
        y += maxNoteLines * 4.5;
        if (noteLines.length > 4) {
          doc.text('...', margin, y);
          y += 4;
        }
      }

      // Catches table
      const sessionCatches = catchesBySession.get(session.id) || [];
      if (sessionCatches.length > 0) {
        checkPageBreak(10 + sessionCatches.length * 5);
        y += 2;

        // Table header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(139, 148, 158);
        doc.text('Species', margin, y);
        doc.text('Length', margin + 40, y);
        doc.text('Fly', margin + 60, y);
        doc.text('Size', margin + 110, y);
        doc.text('Position', margin + 125, y);
        y += 1;
        doc.setDrawColor(33, 38, 45);
        doc.setLineWidth(0.2);
        doc.line(margin, y, margin + contentWidth, y);
        y += 4;

        // Table rows
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(13, 17, 23);
        for (const c of sessionCatches) {
          checkPageBreak(6);
          doc.text(c.species || '—', margin, y);
          doc.text(c.length_inches ? `${c.length_inches}"` : '—', margin + 40, y);
          const flyText = c.fly_name || '—';
          doc.text(flyText.substring(0, 28), margin + 60, y);
          doc.text(c.fly_size || '—', margin + 110, y);
          doc.text(c.fly_position || '—', margin + 125, y);
          y += 5;
        }
      }

      y += 6;
    }

    // Footer
    const lastPage = doc.getNumberOfPages();
    for (let i = 1; i <= lastPage; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(139, 148, 158);
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.text('executiveangler.com', margin, pageHeight - 8);
      doc.text(`Page ${i} of ${lastPage}`, pageWidth - margin - 20, pageHeight - 8);
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    const filename = from && to
      ? `executive-angler-journal-${from}-to-${to}.pdf`
      : `executive-angler-journal-export.pdf`;

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
