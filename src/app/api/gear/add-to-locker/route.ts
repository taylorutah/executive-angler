import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function stripBrandPrefix(productName: string, brandName: string | null): string {
  if (!brandName) return productName;
  const lowered = productName.toLowerCase();
  const brandLower = brandName.toLowerCase();
  if (lowered.startsWith(brandLower + " ")) {
    return productName.slice(brandName.length).trim();
  }
  return productName;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const productId = body?.product_id as string | undefined;
  if (!productId) {
    return NextResponse.json({ error: "product_id required" }, { status: 400 });
  }

  const { data: product, error: productError } = await supabase
    .from("gear_products")
    .select("id, name, category, brand_id, specs")
    .eq("id", productId)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { data: brand } = await supabase
    .from("gear_brands")
    .select("name")
    .eq("id", product.brand_id)
    .single();

  const brandName = brand?.name ?? null;
  const model = stripBrandPrefix(product.name, brandName);

  const { data: gearItem, error: insertError } = await supabase
    .from("gear_items")
    .insert({
      user_id: user.id,
      type: product.category,
      name: product.name,
      maker: brandName,
      model,
      specs: product.specs ?? {},
      gear_product_id: product.id,
    })
    .select()
    .single();

  if (insertError) {
    console.error("[add-to-locker] insert error:", insertError);
    return NextResponse.json({ error: "Failed to add to gear" }, { status: 500 });
  }

  return NextResponse.json({ gearItem });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const productId = body?.product_id as string | undefined;
  if (!productId) {
    return NextResponse.json({ error: "product_id required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("gear_items")
    .delete()
    .eq("user_id", user.id)
    .eq("gear_product_id", productId);

  if (error) {
    console.error("[add-to-locker] delete error:", error);
    return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
