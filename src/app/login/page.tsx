import LoginForm from "./LoginForm";
import { POST_LOGIN_PATH } from "@/lib/auth-paths";

function safeNext(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

interface Props {
  searchParams: Promise<{ next?: string; redirect?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const redirect =
    safeNext(sp.next) ?? safeNext(sp.redirect) ?? POST_LOGIN_PATH;

  return (
    <div className="min-h-screen bg-[var(--surface-page)]">
      <div className="desk-sheet">
        <div className="desk-form">
          <h1
            className="font-heading text-[32px] font-semibold leading-[36px] text-[var(--text-primary)] sm:text-[48px] sm:leading-[56px]"
            style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
          >
            Sign in
          </h1>
          <p className="desk-dek-ui mt-3">Sign in to your account.</p>
          <LoginForm redirect={redirect} authError={sp.error ?? null} />
        </div>
      </div>
    </div>
  );
}
