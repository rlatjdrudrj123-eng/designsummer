import { NextResponse } from "next/server";
import { deleteUpload, checkAuth, isValidKey } from "@/lib/serverImages";

export const runtime = "nodejs";

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
  const key = String(form.get("key") ?? "").trim();
  // 방어적 검증: key 화이트리스트(경로 탐색 차단) 통과 시에만 삭제.
  if (isValidKey(key)) {
    try {
      await deleteUpload(key);
    } catch {
      return NextResponse.redirect(new URL("/admin?e=delete", origin), 303);
    }
  }
  return NextResponse.redirect(new URL("/admin", origin), 303);
}
