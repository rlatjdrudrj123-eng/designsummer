import { NextResponse } from "next/server";
import { saveUpload, checkAuth } from "@/lib/serverImages";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const fwdHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const fwdProto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const origin = fwdHost ? `${fwdProto}://${fwdHost}` : new URL(req.url).origin;
  if (!checkAuth(req)) {
    return NextResponse.redirect(new URL("/admin/login", origin), 303);
  }
  const form = await req.formData();
  const key = String(form.get("key") ?? "").trim();
  const file = form.get("file");
  if (key && file instanceof File && file.size > 0) {
    await saveUpload(key, file);
  }
  return NextResponse.redirect(new URL("/admin", origin), 303);
}
