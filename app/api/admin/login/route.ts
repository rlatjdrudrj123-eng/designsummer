import { NextResponse } from "next/server";
import { COOKIE_NAME, sessionToken } from "@/lib/adminAuth";
import { verifyAdminPassword } from "@/lib/adminPassword";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Behind a proxy/tunnel (e.g. Cloudflare quick tunnel) req.url is the internal
  // localhost origin — redirecting there breaks the browser on the public host.
  // Reconstruct the PUBLIC origin from the forwarded headers when present.
  const fwdHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const fwdProto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const origin = fwdHost ? `${fwdProto}://${fwdHost}` : new URL(req.url).origin;
  const form = await req.formData();
  const pw = String(form.get("password") ?? "");
  // 비번 검증은 Firestore(admin/auth) 우선, 없으면 env ADMIN_PASSWORD 폴백.
  // 쿠키엔 평문이 아니라 SESSION_SECRET 기반 서명 토큰만 저장.
  if (!(await verifyAdminPassword(pw))) {
    return NextResponse.redirect(new URL("/admin/login?e=1", origin), 303);
  }
  const token = await sessionToken();
  const res = NextResponse.redirect(new URL("/admin", origin), 303);
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
