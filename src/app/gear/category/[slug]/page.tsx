import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Legacy category page → /gear?category=<slug>. The new dense list at /gear
 * accepts ?category= as a filter query, so this preserves any external links.
 */
export default async function CategoryRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/gear?category=${encodeURIComponent(slug)}`);
}
