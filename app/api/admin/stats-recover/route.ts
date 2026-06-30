import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/serverImages";
import { getDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

export const runtime = "nodejs";

/* 임시 복구 도구 — 실수로 초기화(삭제)된 stats/auraTest 를 Firestore 버전 보존
   윈도(기본 1시간) 내 과거 시점에서 읽어 되살린다.
   GET ?min=N      → N분 전 시점의 문서 미리보기(카운트만)
   GET ?min=N&apply=1 → 그 시점 데이터로 현재 문서 복원
   복구 완료 후 이 라우트는 제거한다. */

export async function GET(req: Request) {
  if (!(await checkAuth(req))) {
    return new Response("unauthorized", { status: 401 });
  }
  const url = new URL(req.url);
  const minutesAgo = Math.max(1, Number(url.searchParams.get("min") ?? "15"));
  const apply = url.searchParams.get("apply") === "1";

  const db = getDb();
  if (!db) return NextResponse.json({ error: "no db" }, { status: 500 });

  const readTime = Timestamp.fromMillis(Date.now() - minutesAgo * 60_000);
  try {
    const data = await db.runTransaction(
      async (tx) => {
        const snap = await tx.get(db.doc("stats/auraTest"));
        return snap.exists ? (snap.data() ?? null) : null;
      },
      { readOnly: true, readTime },
    );

    if (!data) {
      return NextResponse.json({ found: false, minutesAgo });
    }

    const d = data as Record<string, unknown>;
    const obj = (v: unknown) =>
      v && typeof v === "object" ? Object.keys(v as object).length : 0;
    const preview = {
      starts: d.starts ?? 0,
      completes: d.completes ?? 0,
      shares: d.shares ?? 0,
      resultTypes: obj(d.result),
      qAnswered: obj(d.q),
      ctaTypes: obj(d.cta),
    };

    if (apply) {
      await db.doc("stats/auraTest").set(data);
      return NextResponse.json({ recovered: true, minutesAgo, preview });
    }
    return NextResponse.json({ found: true, minutesAgo, preview });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message, minutesAgo },
      { status: 500 },
    );
  }
}
