import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function FliesV2Redirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/flies/${slug}`);
}
