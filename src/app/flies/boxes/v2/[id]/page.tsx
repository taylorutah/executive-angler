import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BoxV2DetailRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/flies/boxes/${id}`);
}
