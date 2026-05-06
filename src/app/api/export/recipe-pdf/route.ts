import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import type { Personalizations } from '@/lib/flies/resolveFlyForViewer';

/**
 * GET /api/export/recipe-pdf?flyId=<canonical_fly_id>&view=yours|library&variant=<id>
 *
 * Default: when the fly is in the user's box, exports the viewer's resolved
 * recipe (custom name, preferred sizes, per-slot personalizations apply). The
 * user can pass `?view=library` to export the canonical reference instead, or
 * `?variant=<id>` to target a specific variant (otherwise targets primary).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const flyId = searchParams.get('flyId');
  const viewParam = searchParams.get('view');
  const variantParam = searchParams.get('variant');

  if (!flyId) {
    return NextResponse.json({ error: 'Missing flyId parameter' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch canonical first.
    const { data: fly, error: flyError } = await supabase
      .from('canonical_flies')
      .select('*')
      .eq('id', flyId)
      .single();

    // Then resolve the variant — explicit ?variant=<id>, else primary, else
    // the only row, else null. We always scope to the requesting user.
    let flyBoxQuery = supabase
      .from('user_fly_box')
      .select('id, personalizations, preferred_sizes, preferred_colors, personal_notes, custom_image_url, custom_name, variant_label')
      .eq('user_id', user.id)
      .eq('canonical_fly_id', flyId);
    if (variantParam) {
      flyBoxQuery = flyBoxQuery.eq('id', variantParam);
    } else {
      flyBoxQuery = flyBoxQuery
        .order('is_primary', { ascending: false })
        .order('variant_sort_order', { ascending: true })
        .order('added_at', { ascending: true })
        .limit(1);
    }
    const { data: flyBoxRows } = await flyBoxQuery;
    const flyBox = (flyBoxRows && flyBoxRows.length > 0 ? flyBoxRows[0] : null) as
      | {
          id: string;
          personalizations?: Record<string, Record<string, string | undefined>> | null;
          preferred_sizes?: string[] | null;
          preferred_colors?: string[] | null;
          personal_notes?: string | null;
          custom_image_url?: string | null;
          custom_name?: string | null;
          variant_label?: string | null;
        }
      | null;

    if (flyError || !fly) {
      return NextResponse.json({ error: 'Fly pattern not found' }, { status: 404 });
    }

    // Resolve view mode the same way the page does: yours-when-in-box unless
    // the request explicitly asked for library. This keeps the PDF and the
    // page in sync — what you see is what prints.
    const showYours = viewParam === 'library' ? false : !!flyBox;
    const personalizations = (flyBox?.personalizations ?? {}) as Personalizations;

    // Fetch recipe ingredients with materials
    const { data: ingredients } = await supabase
      .from('fly_recipe_ingredients')
      .select('*, material:tying_materials(name, brand, category)')
      .eq('canonical_fly_id', flyId)
      .order('step_position', { ascending: true });

    // Fetch substitution materials
    const allSubIds = (ingredients || [])
      .flatMap((ing: Record<string, unknown>) => (ing.substitute_ids as string[]) || [])
      .filter(Boolean);
    const uniqueSubIds = [...new Set(allSubIds)];
    let subMap: Record<string, { name: string; brand?: string }> = {};
    if (uniqueSubIds.length > 0) {
      const { data: subs } = await supabase
        .from('tying_materials')
        .select('id, name, brand')
        .in('id', uniqueSubIds);
      if (subs) {
        for (const s of subs) subMap[s.id] = { name: s.name, brand: s.brand };
      }
    }

    // Build PDF
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Colors
    const copper = [232, 146, 58] as const;
    const chalk = [240, 246, 252] as const;
    const slate = [168, 178, 189] as const;
    const abyss = [13, 17, 23] as const;
    const depth = [22, 27, 34] as const;

    // Background
    doc.setFillColor(...abyss);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

    // Header bar
    doc.setFillColor(...copper);
    doc.rect(0, 0, pageWidth, 2, 'F');

    y = 14;

    // Title — yours name when set, else canonical
    const displayName = (showYours && flyBox?.custom_name?.trim()) ? flyBox.custom_name.trim() : fly.name;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...chalk);
    doc.text(displayName, margin, y);
    y += 8;

    // "YOUR RECIPE" / "LIBRARY REFERENCE" eyebrow + variant label + canonical name
    if (showYours) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...copper);
      const eyebrow = flyBox?.variant_label
        ? `YOUR RECIPE — ${flyBox.variant_label.toUpperCase()}`
        : 'YOUR RECIPE';
      doc.text(eyebrow, margin, y);
      if (displayName !== fly.name) {
        const eyebrowWidth = doc.getTextWidth(eyebrow);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(110, 118, 129);
        doc.text(`  ·  based on the ${fly.name}`, margin + eyebrowWidth, y);
      }
      y += 5;
    } else if (flyBox) {
      // User has it in their box but exported library reference explicitly.
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...slate);
      doc.text('LIBRARY REFERENCE', margin, y);
      y += 5;
    }

    // Subtitle: category + sizes (yours when overridden)
    const categoryLabel = (fly.category || '').charAt(0).toUpperCase() + (fly.category || '').slice(1);
    const canonicalSizes = (fly.sizes || []) as string[];
    const yoursSizes = (flyBox?.preferred_sizes || []) as string[];
    const sizesToShow = (showYours && yoursSizes.length > 0) ? yoursSizes : canonicalSizes;
    const sizeText = formatSizes(sizesToShow, showYours && yoursSizes.length > 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...slate);
    doc.text([categoryLabel, sizeText].filter(Boolean).join(' — '), margin, y);
    y += 4;

    // Divider
    doc.setDrawColor(...copper);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Recipe ingredients
    if (ingredients && ingredients.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...copper);
      doc.text(showYours ? 'YOUR RECIPE' : 'TYING RECIPE', margin, y);
      y += 7;

      for (let i = 0; i < ingredients.length; i++) {
        const ing = ingredients[i] as Record<string, unknown>;
        const mat = ing.material as { name?: string; brand?: string } | null;
        const role = String(ing.role || '').toUpperCase();
        const slotKey = String(ing.role || '').toLowerCase();
        const slotPersonal = showYours ? personalizations[slotKey] : undefined;
        const yoursDetail = slotPersonal ? joinSlotDetails(slotPersonal) : '';
        const isYoursRow = !!yoursDetail;

        const canonicalName = mat?.name || (ing.material_name as string) || 'Not specified';
        const materialName = isYoursRow ? yoursDetail : canonicalName;
        const brand = isYoursRow ? '' : (mat?.brand || '');
        const colorChoice = isYoursRow
          ? (slotPersonal?.color ? `Color: ${slotPersonal.color}` : '')
          : (ing.color_choice ? `Color: ${ing.color_choice}` : '');
        const sizeChoice = isYoursRow
          ? (slotPersonal?.size ? `Size: ${slotPersonal.size}` : '')
          : (ing.size_choice ? `Size: ${ing.size_choice}` : '');
        const notes = ing.notes ? String(ing.notes) : '';

        // Check if we need a new page
        if (y > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage();
          doc.setFillColor(...abyss);
          doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
          y = margin;
        }

        // Step row background. When this row is overridden, give it a faint
        // copper tint instead of the alternating depth so the Yours rows
        // stand out at a glance even on a printed page.
        const libraryFallback = isYoursRow && canonicalName ? canonicalName : '';
        const rowHeight = notes || libraryFallback ? 14 : 10;
        if (isYoursRow) {
          doc.setFillColor(232, 146, 58, 0.08 as never);
          // jsPDF's setFillColor doesn't accept alpha directly; emulate with a
          // pale tint via a fixed muted copper.
          doc.setFillColor(58, 38, 18); // dark copper-tinted depth
          doc.roundedRect(margin, y - 3, contentWidth, rowHeight, 2, 2, 'F');
        } else if (i % 2 === 0) {
          doc.setFillColor(...depth);
          doc.roundedRect(margin, y - 3, contentWidth, rowHeight, 2, 2, 'F');
        }

        // Step number
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...copper);
        doc.text(`${i + 1}`, margin + 3, y + 1);

        // Role
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...slate);
        doc.text(role, margin + 12, y);

        // Material — copper for Yours rows, chalk for canonical
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        if (isYoursRow) doc.setTextColor(...copper);
        else doc.setTextColor(...chalk);
        doc.text(materialName, margin + 12, y + 5);

        // Details on same line
        const details = [brand, colorChoice, sizeChoice].filter(Boolean).join('  |  ');
        if (details) {
          doc.setFontSize(7);
          doc.setTextColor(...slate);
          const detailX = margin + 12 + doc.getTextWidth(materialName) + 4;
          if (detailX < pageWidth - margin - 10) {
            doc.text(details, detailX, y + 5);
          }
        }

        // Notes
        if (notes) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7);
          doc.setTextColor(110, 118, 129);
          doc.text(notes, margin + 12, y + 10);
        } else if (libraryFallback) {
          // Show the library default in muted small text so the user has the
          // reference at hand when they print.
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(110, 118, 129);
          doc.text(`library: ${libraryFallback}`, margin + 12, y + 10);
        }

        y += rowHeight + 2;

        // Substitutions
        const subIds = (ing.substitute_ids as string[]) || [];
        if (subIds.length > 0) {
          const subNames = subIds
            .map(id => subMap[id])
            .filter(Boolean)
            .map(s => `${s.name}${s.brand ? ` (${s.brand})` : ''}`);
          if (subNames.length > 0) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(11, 165, 199); // teal
            doc.text(`Alternatives: ${subNames.join(', ')}`, margin + 12, y - 1);
            y += 4;
          }
        }
      }
    }

    // Materials list (fallback if no structured recipe). Each row resolves
    // through personalizations[slotKey] so an old-format fly still prints
    // the user's overrides in Yours mode.
    const materialsList = fly.materials_list as { material?: string; description?: string }[] | null;
    if ((!ingredients || ingredients.length === 0) && materialsList && materialsList.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...copper);
      doc.text(showYours ? 'YOUR MATERIALS' : 'MATERIALS', margin, y);
      y += 7;

      for (const entry of materialsList) {
        if (y > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          doc.setFillColor(...abyss);
          doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
          y = margin;
        }

        const label = entry.material || Object.keys(entry)[0] || '';
        const canonicalVal = entry.description || (entry as Record<string, string>)[label] || '';
        const slotKey = label.toLowerCase().split(/\s+/)[0];
        const slotPersonal = showYours ? personalizations[slotKey] : undefined;
        const yoursDetail = slotPersonal ? joinSlotDetails(slotPersonal) : '';
        const isYoursRow = !!yoursDetail;
        const val = isYoursRow ? yoursDetail : canonicalVal;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...slate);
        doc.text(`${label}:`, margin + 4, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        if (isYoursRow) doc.setTextColor(...copper);
        else doc.setTextColor(...chalk);
        doc.text(String(val), margin + 30, y);
        y += 5;
        if (isYoursRow && canonicalVal && canonicalVal !== val) {
          doc.setFontSize(7);
          doc.setTextColor(110, 118, 129);
          doc.text(`library: ${canonicalVal}`, margin + 30, y);
          y += 4;
        }
      }
    }

    // Notes block — yours personal_notes when present, else canonical description.
    const yoursNotes = showYours ? (flyBox?.personal_notes || '').trim() : '';
    const notesText = yoursNotes || (fly.description || '').trim();
    if (notesText) {
      y += 6;
      if (y > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        doc.setFillColor(...abyss);
        doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
        y = margin;
      }

      doc.setDrawColor(...copper);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...copper);
      doc.text(yoursNotes ? 'YOUR NOTES' : 'ABOUT THIS PATTERN', margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...slate);
      const descLines = doc.splitTextToSize(notesText.substring(0, 500), contentWidth);
      doc.text(descLines, margin, y);
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(110, 118, 129);
    doc.text('Generated by Executive Angler — executiveangler.com', margin, footerY);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin, footerY, { align: 'right' });

    // Return PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    const fileBaseName = (showYours && flyBox?.custom_name?.trim()) ? flyBox.custom_name : fly.name;
    const safeName = fileBaseName.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-');
    const variantSuffix = showYours && flyBox?.variant_label
      ? `-${flyBox.variant_label.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-')}`
      : '';
    const fileSuffix = showYours ? `-yours${variantSuffix}` : '';

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}${fileSuffix}-recipe.pdf"`,
      },
    });
  } catch (err) {
    console.error('Recipe PDF generation error:', err);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

/**
 * "Sizes 14–22" when the canonical declares a continuous range, but
 * "Sizes 20, 18, 16" when the user picked specific sizes — listing them
 * literally is closer to how the user thinks about their box.
 */
function formatSizes(sizes: string[], isCustomList: boolean): string {
  if (sizes.length === 0) return '';
  if (sizes.length === 1) return `Size ${sizes[0]}`;
  if (isCustomList) return `Sizes ${sizes.join(', ')}`;
  return `Sizes ${sizes[0]}–${sizes[sizes.length - 1]}`;
}

/**
 * Mirror of joinDetails() in resolveFlyForViewer — kept inline here so the
 * PDF route doesn't drag in client-side imports. Same priority order.
 */
function joinSlotDetails(slot: Record<string, string | undefined>): string {
  const ordered = [
    slot.style,
    slot.size,
    slot.color,
    slot.brand,
    slot.denier,
    slot.model,
  ].filter((s): s is string => Boolean(s && s.trim()));
  const extras = Object.entries(slot)
    .filter(
      ([k, v]) =>
        v && !['style', 'size', 'color', 'brand', 'denier', 'model'].includes(k),
    )
    .map(([, v]) => v as string);
  return [...ordered, ...extras].join(' ').trim();
}
