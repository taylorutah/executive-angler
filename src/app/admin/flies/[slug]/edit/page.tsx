/**
 * Legacy redirect: /admin/flies/[slug]/edit → /flies/[slug]/edit
 *
 * Edits are unified at /flies/[slug]/edit (the page gates admin vs owner
 * server-side). This stub stays so any lingering admin link / bookmark
 * doesn't 404.
 */
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function LegacyAdminEditRedirect({ params, searchParams }: Props) {
  const { slug } = await params;
  const { from } = await searchParams;
  const qs = from ? `?from=${encodeURIComponent(from)}` : "";
  redirect(`/flies/${slug}/edit${qs}`);
}
