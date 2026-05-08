/**
 * Boxes list — all the user's fly boxes with full CRUD.
 *
 * Server-renders the initial list + auth gate. UI for create/edit/delete/
 * set-default lives in <BoxesManager> (client). Each box card still links
 * to /flies/boxes/[id] for its variant detail.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listMyBoxes } from "@/lib/db/fly-v2";
import BoxesManager from "@/components/flies-v2/BoxesManager";

export const metadata = {
  title: "My Fly Boxes — Executive Angler",
};

export default async function BoxesV2Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/flies/boxes");

  const boxes = await listMyBoxes();

  return (
    <main className="min-h-screen bg-[#0D1117] text-[#F0F6FC] pt-14">
      <header className="border-b border-[#21262D] bg-[#161B22]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-['DM_Serif_Display'] text-3xl text-[#F0F6FC] tracking-tight">
            My Fly Boxes
          </h1>
          <p className="mt-1 text-sm text-[#A8B2BD]">
            {boxes.length} {boxes.length === 1 ? "box" : "boxes"} · click any box to see its variants
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <BoxesManager initialBoxes={boxes} />
      </section>
    </main>
  );
}
