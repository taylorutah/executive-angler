import { NextResponse } from "next/server";

// The Founding 50 tier is retired. This endpoint is kept so any cached clients
// or old mobile builds don't 500 — we just return 410 Gone with a stable shape.
export async function GET() {
  return NextResponse.json(
    {
      error: "gone",
      message: "The Founding 50 tier has been retired. See /pricing.",
    },
    { status: 410 },
  );
}
