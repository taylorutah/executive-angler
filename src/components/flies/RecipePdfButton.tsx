'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download } from 'lucide-react';

interface RecipePdfButtonProps {
  flyId: string;
  flyName: string;
}

export function RecipePdfButton({ flyId, flyName }: RecipePdfButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const searchParams = useSearchParams();

  async function handleDownload() {
    setDownloading(true);
    try {
      // Forward view + variant params so the PDF matches what the user is
      // looking at — Yours by default, the active variant when multiple exist.
      const view = searchParams?.get('view');
      const variant = searchParams?.get('variant');
      const qs = new URLSearchParams({ flyId });
      if (view === 'library') qs.set('view', 'library');
      if (variant) qs.set('variant', variant);
      const res = await fetch(`/api/export/recipe-pdf?${qs.toString()}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Download failed' }));
        alert(err.error || 'Failed to download recipe PDF');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${flyName.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-')}-recipe.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download recipe PDF');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--action)]/10 text-[var(--action)] hover:bg-[var(--action)]/20 border border-[var(--action)]/20 transition-colors disabled:opacity-50"
    >
      <Download className="h-3.5 w-3.5" />
      {downloading ? 'Generating...' : 'Download PDF'}
    </button>
  );
}
