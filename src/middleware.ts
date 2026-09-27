import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
  return to;
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const match = request.nextUrl.pathname.match(/^\/flies\/([^/]+)$/);
  if (!match) return response;
  const slug = match[1];
  if (!slug.includes("-private-")) return response;

  const hasAuth = request.cookies
    .getAll()
    .some((c) => c.name.includes("-auth-token") || c.name.startsWith("sb-"));
  const url = request.nextUrl.clone();
  url.pathname = hasAuth ? `/flies/own/${slug}` : "/__missing__";
  return copyCookies(response, NextResponse.rewrite(url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|llms\\.txt).*)",
  ],
};
