import { NextResponse } from "next/server";
import { HEADERS, EXAMPLE_ROW, COLUMNS } from "@/lib/import/csv-schema";

function escapeCsv(val: string): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const headerLine = HEADERS.map(escapeCsv).join(",");
  const exampleLine = COLUMNS.map((c) => escapeCsv(EXAMPLE_ROW[c.key] || "")).join(",");
  const emptyLine = COLUMNS.map(() => "").join(",");

  const csv = [headerLine, exampleLine, emptyLine].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="executive-angler-import-template.csv"',
    },
  });
}
