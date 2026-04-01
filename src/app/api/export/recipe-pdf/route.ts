import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { checkPremium } from '@/lib/admin';

/**
 * GET /api/export/recipe-pdf?flyId=<canonical_fly_id>
 * Generates a one-page printable recipe card PDF for a canonical fly pattern.
 * Premium-gated.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const flyId = searchParams.get('flyId');

  if (!flyId) {
    return NextResponse.json({ error: 'Missing flyId parameter' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Premium check
  const isPremium = await checkPremium(supabase, user.id, user.email || '');
  if (!isPremium) {
    return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
  }

  try {
    // Fetch the fly
    const { data: fly, error: flyError } = await supabase
      .from('canonical_flies')
      .select('*')
      .eq('id', flyId)
      .single();

    if (flyError || !fly) {
      return NextResponse.json({ error: 'Fly pattern not found' }, { status: 404 });
    }

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

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...chalk);
    doc.text(fly.name, margin, y);
    y += 8;

    // Subtitle: category + sizes
    const categoryLabel = (fly.category || '').charAt(0).toUpperCase() + (fly.category || '').slice(1);
    const sizes = (fly.sizes || []) as string[];
    const sizeText = sizes.length > 1 ? `Sizes ${sizes[0]}–${sizes[sizes.length - 1]}` : sizes.length === 1 ? `Size ${sizes[0]}` : '';
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
      doc.text('TYING RECIPE', margin, y);
      y += 7;

      for (let i = 0; i < ingredients.length; i++) {
        const ing = ingredients[i] as Record<string, unknown>;
        const mat = ing.material as { name?: string; brand?: string } | null;
        const role = String(ing.role || '').toUpperCase();
        const materialName = mat?.name || (ing.material_name as string) || 'Not specified';
        const brand = mat?.brand || '';
        const colorChoice = ing.color_choice ? `Color: ${ing.color_choice}` : '';
        const sizeChoice = ing.size_choice ? `Size: ${ing.size_choice}` : '';
        const notes = ing.notes ? String(ing.notes) : '';

        // Check if we need a new page
        if (y > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage();
          doc.setFillColor(...abyss);
          doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
          y = margin;
        }

        // Step row background
        const rowHeight = notes ? 14 : 10;
        if (i % 2 === 0) {
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

        // Material
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...chalk);
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

    // Materials list (fallback if no structured recipe)
    const materialsList = fly.materials_list as Record<string, string>[] | null;
    if ((!ingredients || ingredients.length === 0) && materialsList && materialsList.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...copper);
      doc.text('MATERIALS', margin, y);
      y += 7;

      for (const entry of materialsList) {
        if (y > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          doc.setFillColor(...abyss);
          doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
          y = margin;
        }

        const key = Object.keys(entry)[0] || '';
        const val = entry[key] || '';
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...slate);
        doc.text(`${key}:`, margin + 4, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...chalk);
        doc.text(String(val), margin + 30, y);
        y += 5;
      }
    }

    // Description (brief)
    if (fly.description) {
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
      doc.text('ABOUT THIS PATTERN', margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...slate);
      const descLines = doc.splitTextToSize(fly.description.substring(0, 500), contentWidth);
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
    const safeName = fly.name.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}-recipe.pdf"`,
      },
    });
  } catch (err) {
    console.error('Recipe PDF generation error:', err);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
