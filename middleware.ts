import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";

/* /admin 보호 — 쿠키 세션 (CLAUDE.md §3). ADMIN_PASSWORD 환경변수.
   쿠키엔 평문이 아니라 서명 토큰만 있고, verifySessionToken 이 timing-safe 비교한다. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const token = req.cookies.get(COOKIE_NAME)?.value ?? "";
  // ADMIN_PASSWORD 미설정 시 verifySessionToken 이 항상 false → /admin 잠금(접근 차단).
  if (!(await verifySessionToken(token))) {
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
