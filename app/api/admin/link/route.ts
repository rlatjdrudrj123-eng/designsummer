import { NextResponse } from "next/server";
import { saveLink, deleteLink, checkAuth } from "@/lib/serverImages";

export const runtime = "nodejs";

/* 이미지(대표작 썸네일)별 링크 저장. content/imageLinks.json 에 key → url 기록.
   (이미지 라우트와 동일하게 x-forwarded-host 오리진 패턴으로 리다이렉트.) */

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
  const url = String(form.get("url") ?? "").trim();
  if (key) {
    if (url) await saveLink(key, url);
    else await deleteLink(key);
  }

  return NextResponse.redirect(new URL("/admin", origin), 303);
}
