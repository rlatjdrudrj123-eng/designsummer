import { FieldValue } from "firebase-admin/firestore";
import { checkAuth } from "@/lib/serverImages";
import { getDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

/* 임시 도구 — 설문 개편(v2) 이후 수집분만 제거.
   루트 카운터에서 v2 미러 값을 그대로 차감해 '개편 이전 상태'로 되돌리고,
   v2/sv/contacts 필드와 responses·contacts 컬렉션을 비운다. 실행 후 제거할 것. */

async function clearCollection(
  db: FirebaseFirestore.Firestore,
  name: string,
): Promise<number> {
  let removed = 0;
  for (;;) {
    const snap = await db.collection(name).limit(400).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    removed += snap.size;
    if (snap.size < 400) break;
  }
  return removed;
}

export async function POST(req: Request): Promise<Response> {
  if (!(await checkAuth(req))) {
    return new Response("unauthorized", { status: 401 });
  }
  const db = getDb();
  if (!db) return Response.json({ error: "no db" }, { status: 500 });

  try {
    const ref = db.doc("stats/auraTest");
    const snap = await ref.get();
    const d = (snap.data() ?? {}) as {
      v2?: {
        starts?: number;
        completes?: number;
        shares?: number;
        cta?: Record<string, number>;
        result?: Record<string, number>;
        q?: Record<string, Record<string, number>>;
      };
    };
    const v2 = d.v2 ?? {};

    // 루트 누적치에서 v2 분을 차감(update 는 점 표기법을 중첩 경로로 처리).
    const upd: Record<string, unknown> = {};
    for (const k of ["starts", "completes", "shares"] as const) {
      const n = v2[k];
      if (n) upd[k] = FieldValue.increment(-n);
    }
    for (const [k, n] of Object.entries(v2.cta ?? {})) {
      if (n) upd[`cta.${k}`] = FieldValue.increment(-n);
    }
    for (const [k, n] of Object.entries(v2.result ?? {})) {
      if (n) upd[`result.${k}`] = FieldValue.increment(-n);
    }
    for (const [qi, m] of Object.entries(v2.q ?? {})) {
      for (const [ci, n] of Object.entries(m ?? {})) {
        if (n) upd[`q.${qi}.${ci}`] = FieldValue.increment(-n);
      }
    }
    // 개편 이후 전용 필드는 통째로 제거.
    upd.v2 = FieldValue.delete();
    upd.sv = FieldValue.delete();
    upd.contacts = FieldValue.delete();
    await ref.update(upd);

    const responses = await clearCollection(db, "responses");
    const contacts = await clearCollection(db, "contacts");

    return Response.json({
      ok: true,
      subtracted: {
        starts: v2.starts ?? 0,
        completes: v2.completes ?? 0,
        shares: v2.shares ?? 0,
      },
      deleted: { responses, contacts },
    });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
