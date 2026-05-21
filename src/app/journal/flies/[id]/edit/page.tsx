/**
 * Legacy redirect: /journal/flies/[id]/edit → /flies/[slug]/edit
 *
 * Pre-2026-05-15 split owner edits under /journal/flies/ and canonical
 * edits under /admin/flies/. The post-reset fly identity model collapses
 * them into one route at /flies/[slug]/edit gated by status + viewer.
 * This redirect keeps old bookmarks alive.
 */
import { redirect, notFound } from "next/navigation";
import { getFlyById } from "@/lib/db/fly-model";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ just_forked?: string }>;
}

export default async function LegacyOwnerEditRedirect({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const fly = await getFlyById(id);
  if (!fly) notFound();
  const qs = sp.just_forked ? `?just_forked=${sp.just_forked}` : "";
  redirect(`/flies/${fly.slug}/edit${qs}`);
}
