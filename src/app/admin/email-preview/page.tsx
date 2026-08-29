import { buildBrandedEmail } from "@/lib/email/templates";
import PreviewNav from "./PreviewNav";
import SendTestButton from "./SendTestButton";
import { EMAIL_SAMPLES } from "./samples";

export const dynamic = "force-dynamic";

export default function EmailPreviewPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="max-w-5xl mx-auto px-6 py-10 text-[var(--text-1)]">
        <header className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-1)] mb-2">Email Preview</h1>
          <p className="text-sm text-[var(--text-2)] leading-relaxed max-w-2xl">
            Every transactional email rendered with sample data. These are the
            exact templates that go out in production — any edits you make to{" "}
            <code className="text-[var(--accent)]">src/lib/email/senders.ts</code> or{" "}
            <code className="text-[var(--accent)]">src/lib/email/templates.ts</code>{" "}
            show up here. Use <strong>Send test</strong> on any template to
            deliver it to your inbox via Resend.
          </p>
        </header>

        <PreviewNav
          items={EMAIL_SAMPLES.map((p) => ({ key: p.key, label: p.label }))}
        />

        <div className="space-y-12">
          {EMAIL_SAMPLES.map((p) => {
            const html = buildBrandedEmail(p.content);
            return (
              <section key={p.key} id={p.key} className="scroll-mt-8">
                <div className="mb-3 flex items-baseline justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-[var(--text-1)]">
                      {p.label}
                    </h2>
                    <p className="text-xs text-[var(--text-3)] mt-0.5">{p.when}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <code className="text-xs text-[var(--text-2)]">{p.key}</code>
                    <SendTestButton templateKey={p.key} />
                  </div>
                </div>
                <div className="mb-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
                  <div className="flex gap-6 text-xs flex-wrap">
                    <div>
                      <span className="text-[var(--text-3)]">Subject:&nbsp;</span>
                      <span className="text-[var(--text-1)] font-medium">
                        {p.content.subject}
                      </span>
                    </div>
                    {p.content.preheader && (
                      <div className="truncate">
                        <span className="text-[var(--text-3)]">Preheader:&nbsp;</span>
                        <span className="text-[var(--text-2)] italic">
                          {p.content.preheader}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <iframe
                  title={p.label}
                  srcDoc={html}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)]"
                  style={{ height: "720px" }}
                />
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
