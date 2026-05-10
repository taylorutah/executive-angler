"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Clock, AlertTriangle, CheckCircle, X } from "lucide-react";
import TurnstileWidget from "@/components/ui/TurnstileWidget";

const TURNSTILE_SITE_KEY = "0x4AAAAAAACzmkL0lBFlfTsxp";

interface PendingSubmission {
  id: string;
  status: string;
  admin_notes: string | null;
}

interface Props {
  patternId: string;
  pendingSubmission: PendingSubmission | null;
  isAdminUser: boolean;
}

export default function SubmitToLibraryButton({
  patternId,
  pendingSubmission,
  isAdminUser,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [captchaAvailable, setCaptchaAvailable] = useState(true);
  const [honeypot, setHoneypot] = useState("");

  // Already pending or in needs-info — show status pill, not the submit button.
  if (pendingSubmission && pendingSubmission.status === "pending") {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-600/30 bg-yellow-600/10 text-yellow-300 text-xs font-semibold">
        <Clock className="h-3.5 w-3.5" /> Pending library review
      </div>
    );
  }
  if (pendingSubmission && pendingSubmission.status === "needs_info") {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-600/30 bg-yellow-600/10 text-yellow-300 text-xs font-semibold" title={pendingSubmission.admin_notes ?? undefined}>
        <AlertTriangle className="h-3.5 w-3.5" /> Reviewer needs more info
      </div>
    );
  }
  // Rejected — let owner re-submit (they may have edited the pattern).
  // Falls through to the submit button.

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/fishing/flies/submit-to-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pattern_id: patternId,
          turnstile_token: token,
          website: honeypot,
          notes_to_reviewer: notes || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Submission failed");
        setBusy(false);
        return;
      }
      setOpen(false);
      setBusy(false);
      // Admin path returns canonical_id; refresh shows the redirect.
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#00B4D8]/40 bg-[#00B4D8]/10 text-[#00B4D8] text-xs font-semibold hover:bg-[#00B4D8]/20 transition-colors"
      >
        <Upload className="h-3.5 w-3.5" />
        {isAdminUser ? "Add to library" : "Submit to library"}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            className="bg-[#161B22] border border-[#30363D] rounded-lg max-w-md w-full p-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => !busy && setOpen(false)}
              className="absolute top-3 right-3 text-cream/50 hover:text-cream"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading text-lg mb-1">
              {isAdminUser ? "Add this fly to the library" : "Submit to the library"}
            </h3>
            <p className="text-xs text-cream/60 mb-4">
              {isAdminUser
                ? "This pattern goes straight into the canonical library. Your personal copy stays in your box."
                : "An admin reviews submissions before they go public. Your personal copy stays in your box either way."}
            </p>

            {pendingSubmission?.status === "rejected" && pendingSubmission.admin_notes && (
              <div className="mb-3 text-xs bg-red-500/10 border border-red-500/30 text-red-300 rounded p-2">
                <strong>Previous reviewer note:</strong> {pendingSubmission.admin_notes}
              </div>
            )}

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E7681]">
                Notes for reviewer (optional)
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Anything the reviewer should know — origin, who taught you, when you've been fishing it…"
                className="mt-1 w-full bg-[#0D1117] border border-[#30363D] rounded p-2 text-sm placeholder:text-cream/30"
              />
            </label>

            {/* Honeypot */}
            <input
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-10000px",
                width: "1px",
                height: "1px",
                opacity: 0,
              }}
            />

            {!isAdminUser && (
              <div className="mt-3">
                <TurnstileWidget
                  siteKey={TURNSTILE_SITE_KEY}
                  onToken={setToken}
                  onAvailabilityChange={setCaptchaAvailable}
                />
              </div>
            )}

            {error && (
              <div className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded p-2">
                {error}
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="px-3 py-1.5 rounded text-sm text-cream/70 hover:text-cream"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={
                  busy ||
                  (!isAdminUser && captchaAvailable && !token)
                }
                className="px-4 py-1.5 rounded bg-[#E8923A] text-black font-semibold text-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {busy ? (
                  "Submitting…"
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {isAdminUser ? "Add to library" : "Submit"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
