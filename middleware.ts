import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* /admin 보호 — 쿠키 세션 (CLAUDE.md §3). ADMIN_PASSWORD 환경변수. */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const token = req.cookies.get("ds_admin")?.value;
  if (!process.env.ADMIN_PASSWORD || token !== process.env.ADMIN_PASSWORD) {
    // Use the PUBLIC host (proxy/tunnel) for the redirect, not the internal one.
    const fwdHost =
      req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    const url = fwdHost
      ? new URL(
          "/admin/login",
          `${req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "")}://${fwdHost}`,
        )
      : new URL("/admin/login", req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
