import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { checkAuth } from "@/lib/serverImages";
import { writeAuraOverride } from "@/lib/auraOverrides";
import type { AuraOverride } from "@/lib/auraContent";

export const runtime = "nodejs";

/* /aura 연사 텍스트 저장 — Firestore(content/auraSpeakers) 의 overrides.{id} 에 병합.
   (App Hosting 은 FS 가 휘발성이라 파일 저장은 안 남음 → Firestore 영구 저장.)
   저장 후 홈·결과 페이지 캐시를 무효화해 즉시 반영한다. */

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
  const id = String(form.get("id") ?? "").trim();
  if (id) {
    const credentials = String(form.get("credentials") ?? "")
      .split(/\r?\n/)
      .map((c) => c.trim())
      .filter(Boolean);
    const entry: AuraOverride = {
      studio: String(form.get("studio") ?? "").trim(),
      name: String(form.get("name") ?? "").trim(),
      role: String(form.get("role") ?? "").trim(),
      sessionTitle: String(form.get("sessionTitle") ?? "").trim(),
      sessionDesc: String(form.get("sessionDesc") ?? "").trim(),
      credentials,
      url: String(form.get("url") ?? "").trim(),
    };
    const ok = await writeAuraOverride(id, entry);
    if (ok) {
      revalidatePath("/");
      revalidatePath("/r");
      revalidatePath("/aura");
    }
    return NextResponse.redirect(
      new URL(ok ? "/admin?saved=1" : "/admin?saved=err", origin),
      303,
    );
  }

  return NextResponse.redirect(new URL("/admin", origin), 303);
}
