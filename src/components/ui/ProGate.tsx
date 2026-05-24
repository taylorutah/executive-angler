/**
 * Executive Angler — Pro Gate
 *
 * Compact upgrade gate used on Pro-only pages. Replaces the assortment of
 * one-off "Premium Feature" cards scattered across /journal/insights,
 * /dashboard/insights, /dashboard/analytics, etc. Field-journal voice,
 * tight padding, single primary CTA.
 */

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProGateProps {
  feature: string;
  /** One-sentence pitch — what this feature does. */
  pitch: string;
}

export default function ProGate({ feature, pitch }: ProGateProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#161B22] border border-[#21262D] rounded-xl p-6 text-center">
        <div className="font-mono text-[10px] text-[#E8923A] uppercase tracking-[0.18em] mb-3 inline-flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          Pro
        </div>
        <h1 className="font-heading text-[22px] text-[#F0F6FC] mb-2 tracking-[-0.01em]">{feature}</h1>
        <p className="text-[13px] text-[#A8B2BD] mb-5 leading-relaxed">{pitch}</p>
        <Button href="/pricing" variant="solid" size="md">
          See plans &amp; pricing
        </Button>
      </div>
    </div>
  );
}
