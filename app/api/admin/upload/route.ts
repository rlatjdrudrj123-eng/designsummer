import { NextResponse } from "next/server";
import { saveUpload, checkAuth, isValidKey } from "@/lib/serverImages";

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
  const file = form.get("file");
  // 방어적 검증: key 화이트리스트 + 파일 존재. 부적합 시 입력 오류로 거부.
  if (!isValidKey(key) || !(file instanceof File) || file.size === 0) {
    return NextResponse.redirect(new URL("/admin?e=upload", origin), 303);
  }
  try {
    await saveUpload(key, file);
  } catch (err) {
    const msg = encodeURIComponent(
      ((err as Error)?.message || "unknown").slice(0, 200),
    );
    return NextResponse.redirect(
      new URL(`/admin?e=upload&msg=${msg}`, origin),
      303,
    );
  }
  return NextResponse.redirect(new URL("/admin", origin), 303);
}
