import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import {
  flyboxExportFilename,
  formatTierLabel,
  loadFlyboxExport,
  parseFlyboxSelection,
  selectionSubtitle,
  summarizeExport,
  type FlyboxExportRow,
} from "@/lib/export/flybox";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const selection = parseFlyboxSelection(searchParams);

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (selection.kind === "empty") {
    return NextResponse.json({ error: "No boxes selected" }, { status: 400 });
  }

  try {
    const [{ data: profile }, loaded] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, username")
        .eq("user_id", user.id)
        .maybeSingle(),
      loadFlyboxExport(supabase, user.id, selection),
    ]);

    if (!loaded.ok) {
      return NextResponse.json({ error: loaded.error }, { status: 400 });
    }

    const { boxes, rows, exportedAll } = loaded.data;
    const rowsByBox = new Map<string, FlyboxExportRow[]>();
    for (const row of rows) {
      const list = rowsByBox.get(row.boxId) ?? [];
      list.push(row);
      rowsByBox.set(row.boxId, list);
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (needed: number) => {
      const pageHeight = doc.internal.pageSize.getHeight();
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    const clip = (text: string, maxWidth: number) => {
      if (doc.getTextWidth(text) <= maxWidth) return text;
      let s = text;
      while (s.length > 1 && doc.getTextWidth(`${s}…`) > maxWidth) s = s.slice(0, -1);
      return `${s}…`;
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(13, 17, 23);
    doc.text("Fly Box Inventory", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(139, 148, 158);
    const anglerName = profile?.display_name || profile?.username || user.email || "Angler";
    const dateLabel = new Date().toLocaleDateString();
    const scope = selectionSubtitle(exportedAll, boxes);
    const subtitleLines = doc.splitTextToSize(
      `${anglerName} — ${dateLabel} — ${scope}`,
      contentWidth,
    ) as string[];
    doc.text(subtitleLines, margin, y);
    y += subtitleLines.length * 5 + 4;

    const totals = summarizeExport(rows);
    doc.setFillColor(232, 146, 58, 0.1);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(232, 146, 58);
    const statsX = margin + 6;
    doc.text(`${boxes.length} ${boxes.length === 1 ? "box" : "boxes"}`, statsX, y + 7.5);
    doc.text(`${totals.versions} ${totals.versions === 1 ? "version" : "versions"}`, statsX + 32, y + 7.5);
    doc.text(`Tied ${totals.tied}`, statsX + 72, y + 7.5);
    doc.text(`Bought ${totals.bought}`, statsX + 102, y + 7.5);
    doc.text(`Need ${totals.need}`, statsX + 138, y + 7.5);
    y += 18;

    const col = {
      fly: margin,
      version: margin + 38,
      size: margin + 88,
      tied: margin + 106,
      bought: margin + 122,
      total: margin + 140,
      target: margin + 156,
      need: margin + 172,
    };

    const drawTableHeader = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(139, 148, 158);
      doc.text("Fly", col.fly, y);
      doc.text("Version", col.version, y);
      doc.text("Size", col.size, y);
      doc.text("Tied", col.tied, y);
      doc.text("Bought", col.bought, y);
      doc.text("Total", col.total, y);
      doc.text("Target", col.target, y);
      doc.text("Need", col.need, y);
      y += 1;
      doc.setDrawColor(33, 38, 45);
      doc.setLineWidth(0.2);
      doc.line(margin, y, margin + contentWidth, y);
      y += 4;
    };

    for (const box of boxes) {
      const boxRows = rowsByBox.get(box.id) ?? [];
      const headerNeed = 22 + (box.description ? 5 : 0) + 10;
      checkPageBreak(headerNeed);

      doc.setDrawColor(33, 38, 45);
      doc.setLineWidth(0.3);
      doc.line(margin, y, margin + contentWidth, y);
      y += 6;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(13, 17, 23);
      doc.text(clip(`${box.name}  ·  ${formatTierLabel(box.tier)}`, contentWidth), margin, y);
      y += 5;

      if (box.description) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(139, 148, 158);
        doc.text(clip(box.description, contentWidth), margin, y);
        y += 5;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(139, 148, 158);
      doc.text(
        `${boxRows.length} ${boxRows.length === 1 ? "version" : "versions"}`,
        margin,
        y,
      );
      y += 6;

      if (boxRows.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(139, 148, 158);
        doc.text("No flies in this box", margin, y);
        y += 8;
        continue;
      }

      checkPageBreak(12);
      drawTableHeader();

      for (const r of boxRows) {
        if (checkPageBreak(8)) {
          drawTableHeader();
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(13, 17, 23);
        doc.text(clip(r.flyName, 36), col.fly, y);
        doc.text(clip(r.version, 48), col.version, y);
        doc.text(r.size || "—", col.size, y);
        doc.text(String(r.tied), col.tied, y);
        doc.text(String(r.bought), col.bought, y);
        doc.text(String(r.total), col.total, y);
        doc.text(String(r.target), col.target, y);
        if (r.need > 0) {
          doc.setTextColor(232, 146, 58);
          doc.text(String(r.need), col.need, y);
        } else {
          doc.setTextColor(139, 148, 158);
          doc.text("—", col.need, y);
        }
        y += 5;
      }
      y += 6;
    }

    const lastPage = doc.getNumberOfPages();
    for (let i = 1; i <= lastPage; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(139, 148, 158);
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.text("executiveangler.com", margin, pageHeight - 8);
      doc.text(`Page ${i} of ${lastPage}`, pageWidth - margin - 20, pageHeight - 8);
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const filename = flyboxExportFilename(boxes, "pdf");

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Flybox PDF export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
