import SignupForm from "./SignupForm";

function safeNext(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function SignupPage({ searchParams }: Props) {
  const sp = await searchParams;
  const next = safeNext(sp.next);

  return (
    <div className="bg-[var(--paper)]">
      <div className="desk-sheet">
        <div className="desk-form">
          <h1
            className="font-heading text-[32px] font-semibold leading-[36px] text-[var(--text-primary)] sm:text-[48px] sm:leading-[56px]"
            style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
          >
            Create an account
          </h1>
          <p className="desk-dek-ui mt-3">
            Create a free account to save favorites and log your sessions.
          </p>
          <SignupForm next={next} />
        </div>
      </div>
    </div>
  );
}
