import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/serverImages";
import { verifyAdminPassword, setAdminPassword } from "@/lib/adminPassword";

export const runtime = "nodejs";

/* 어드민 비밀번호 변경 — 현재 비번 확인 후 새 비번을 Firestore(admin/auth)에 저장.
   세션 토큰은 SESSION_SECRET 기반(비번 비의존)이라 변경 후에도 로그인 세션은 유지된다. */

export async function POST(req: Request) {
  const fwdHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const fwdProto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const origin = fwdHost ? `${fwdProto}://${fwdHost}` : new URL(req.url).origin;
  if (!(await checkAuth(req))) {
    return NextResponse.redirect(new URL("/admin/login", origin), 303);
  }

  const form = await req.formData();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");

  // 현재 비번 검증 + 새 비번 최소 길이(4).
  if (!(await verifyAdminPassword(current))) {
    return NextResponse.redirect(new URL("/admin?pw=current", origin), 303);
  }
  if (next.trim().length < 4) {
    return NextResponse.redirect(new URL("/admin?pw=short", origin), 303);
  }

  const ok = await setAdminPassword(next.trim());
  return NextResponse.redirect(
    new URL(ok ? "/admin?pw=ok" : "/admin?pw=err", origin),
    303,
  );
}
