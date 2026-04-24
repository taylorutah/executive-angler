import { NextResponse } from "next/server";

// The Founding 50 tier is retired. All hits return 410 Gone so anyone still
// bookmarking or linking the old button sees a clear, stable error.
export async function POST() {
  return NextResponse.json(
    {
      error: "gone",
      message:
        "The Founding 50 tier has been retired. Pro is now $2.99/mo or $19.99/yr with a 30-day money-back guarantee.",
    },
    { status: 410 },
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: "gone",
      message: "The Founding 50 tier has been retired. See /pricing.",
    },
    { status: 410 },
  );
}
