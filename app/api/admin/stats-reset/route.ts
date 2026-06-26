import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/serverImages";
import { getDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

/* 동물상 테스트 통계 초기화 — stats/auraTest 문서를 삭제(다음 이벤트부터 새로 생성).
   테스트·디버깅으로 쌓인 가짜 데이터를 비우고 깨끗한 상태로 시작할 때 사용. */

export async function POST(req: Request) {
  const fwdHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const fwdProto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const origin = fwdHost ? `${fwdProto}://${fwdHost}` : new URL(req.url).origin;
  if (!(await checkAuth(req))) {
    return NextResponse.redirect(new URL("/admin/login", origin), 303);
  }

  const db = getDb();
  let ok = false;
  if (db) {
    try {
      await db.doc("stats/auraTest").delete();
      ok = true;
    } catch {
      ok = false;
    }
  }
  return NextResponse.redirect(
    new URL(ok ? "/admin/stats?reset=1" : "/admin/stats?reset=err", origin),
    303,
  );
}
