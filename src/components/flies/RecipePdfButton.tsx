'use client';

import { useState } from 'react';
import { Download, Lock } from 'lucide-react';

interface RecipePdfButtonProps {
  flyId: string;
  flyName: string;
  isPremium: boolean;
}

export function RecipePdfButton({ flyId, flyName, isPremium }: RecipePdfButtonProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!isPremium) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/export/recipe-pdf?flyId=${flyId}`);
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

  if (!isPremium) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#161B22] border border-[#21262D] text-[#6E7681] cursor-not-allowed"
        title="Premium feature — upgrade to download recipe PDFs"
      >
        <Lock className="h-3.5 w-3.5" />
        Download PDF
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#E8923A]/10 text-[#E8923A] hover:bg-[#E8923A]/20 border border-[#E8923A]/20 transition-colors disabled:opacity-50"
    >
      <Download className="h-3.5 w-3.5" />
      {downloading ? 'Generating...' : 'Download PDF'}
    </button>
  );
}
