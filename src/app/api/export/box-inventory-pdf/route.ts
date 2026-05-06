import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { getBoxById, getEntriesInBox } from "@/lib/db/fly-boxes";

/**
 * GET /api/export/box-inventory-pdf?boxId=<fly_box_id>
 *
 * Generates a printable inventory list for a single fly box: name, tier,
 * total counts, and per-fly rows with size×count breakdown plus personal notes.
 *
 * Designed to be folded and tucked into the lid of a tackle box — letter-sized,
 * dense rows, monochrome-friendly.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const boxId = searchParams.get("boxId");
  if (!boxId) {
    return NextResponse.json({ error: "Missing boxId parameter" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const box = await getBoxById(boxId);
    if (!box || box.user_id !== user.id) {
      return NextResponse.json({ error: "Box not found" }, { status: 404 });
    }
    const entries = await getEntriesInBox(boxId);

    // Compute totals
    const totalFlies = entries.length;
    let totalQuantity = 0;
    for (const e of entries) {
      const q = e.quantity_by_size;
      if (q) {
        totalQuantity += Object.values(q).reduce(
          (sum, n) => sum + (typeof n === "number" ? n : 0),
          0,
        );
      }
    }

    // Build the PDF
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 40;
    const contentW = pageW - margin * 2;
    let y = margin;

    // Title block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(20, 20, 20);
    doc.text(box.name, margin, y);
    y += 24;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const tierLabel = ({
      kill: "Tier 1 — Kill Box",
      support: "Tier 2 — Support Box",
      archive: "Tier 3 — Archive",
      custom: "Custom",
    } as const)[box.tier];
    doc.text(tierLabel.toUpperCase(), margin, y);
    y += 14;

    if (box.description) {
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(box.description, contentW);
      doc.text(lines, margin, y);
      y += lines.length * 12 + 4;
    }

    // Stats summary
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    const summary = [
      `${totalFlies} ${totalFlies === 1 ? "pattern" : "patterns"}`,
      `${totalQuantity} flies tied`,
      box.total_capacity ? `capacity ${box.total_capacity}` : null,
    ]
      .filter(Boolean)
      .join("  ·  ");
    doc.text(summary, margin, y);
    y += 16;

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, margin + contentW, y);
    y += 18;

    // Entries
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    if (entries.length === 0) {
      doc.setTextColor(120, 120, 120);
      doc.text("This box is empty.", margin, y);
    } else {
      for (const entry of entries) {
        // Page-break check (leave ~80pt buffer for a row + spacing)
        if (y > doc.internal.pageSize.getHeight() - 80) {
          doc.addPage();
          y = margin;
        }

        const canonical = entry.canonical_fly;
        const name = entry.custom_name || canonical?.name || "Untitled";

        // Name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(20, 20, 20);
        doc.text(name, margin, y);

        // Sizes & quantities (right-aligned)
        const q = entry.quantity_by_size ?? {};
        const sizesList = Object.entries(q)
          .filter(([, n]) => typeof n === "number" && n > 0)
          .map(([size, n]) => `${n}×#${size}`)
          .join("  ");
        if (sizesList) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(232, 146, 58); // copper for emphasis
          const w = doc.getTextWidth(sizesList);
          doc.text(sizesList, margin + contentW - w, y);
        } else if (entry.preferred_sizes && entry.preferred_sizes.length > 0) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          const sizesText = `sizes: ${entry.preferred_sizes.join(", ")}`;
          const w = doc.getTextWidth(sizesText);
          doc.text(sizesText, margin + contentW - w, y);
        }
        y += 14;

        // Recipe summary line — pull a few key slots from personalizations.
        const p = entry.personalizations ?? {};
        const slotParts: string[] = [];
        const summarizeSlot = (slot: string, prefix: string) => {
          const s = p[slot];
          if (!s) return;
          const text = [s.brand, s.model, s.size, s.denier, s.color]
            .filter(Boolean)
            .join(" ");
          if (text) slotParts.push(`${prefix} ${text}`);
        };
        summarizeSlot("hook", "Hook:");
        summarizeSlot("bead", "Bead:");
        summarizeSlot("thread", "Thread:");
        summarizeSlot("body", "Body:");
        summarizeSlot("tail", "Tail:");

        if (slotParts.length > 0) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(60, 60, 60);
          const recipeLine = slotParts.join("  ·  ");
          const lines = doc.splitTextToSize(recipeLine, contentW);
          doc.text(lines, margin, y);
          y += lines.length * 11;
        }

        // Personal notes
        if (entry.personal_notes && entry.personal_notes.trim()) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          const noteLines = doc.splitTextToSize(
            `Note: ${entry.personal_notes.trim()}`,
            contentW,
          );
          doc.text(noteLines, margin, y);
          y += noteLines.length * 11;
        }

        // Row separator
        y += 6;
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, y, margin + contentW, y);
        y += 10;
      }
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const pageH = doc.internal.pageSize.getHeight();
      doc.text(
        `executiveangler.com — ${box.name} inventory · ${i}/${pageCount}`,
        margin,
        pageH - 20,
      );
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const safeName = box.name.replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "-");
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}-inventory.pdf"`,
      },
    });
  } catch (err) {
    console.error("[box-inventory-pdf]", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
