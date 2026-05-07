import { permanentRedirect } from "next/navigation";

export default async function LegacyMyBoxDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  permanentRedirect(`/flies/boxes/${id}`);
}
