/* ============================================================================
 * /api/track — 바이럴 동물상 테스트의 자체 통계 수집 (공개·인증 없음).
 *
 * Firestore 단일 문서 stats/auraTest 에 FieldValue.increment 로 1요청=1 update.
 * 항상 즉시 204 를 돌려주고 클라이언트로 에러를 던지지 않는다(fire-and-forget).
 * Firestore 자격증명이 없으면(getDb()===null) 조용히 no-op.
 *
 * 알려진 한계(보고서 참조): 단일 문서 카운터라 viral 스파이크 시 ~1write/sec 경합,
 * 공개 API 라 악의적 인플레이션 가능(헤비 레이트리밋·인증 없음).
 * ========================================================================== */

import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";
import { ANIMALS, QUESTIONS } from "@/lib/animalTest";

export const runtime = "nodejs";

const STATS_DOC = "stats/auraTest";

// animalId 화이트리스트 — 메인 9종 + 히든 백조.
const ANIMAL_IDS = new Set<string>([...Object.keys(ANIMALS), "swan"]);

const NUM_QUESTIONS = QUESTIONS.length; // 17
const MAX_CHOICES = 4; // 각 문항 4지선다 (ci 0..3)

const SECTION_KEYS = new Set<string>(["A", "B"]);

function noContent(): Response {
  // 본문 없는 204. 클라이언트는 sendBeacon/keepalive 라 응답을 신경 쓰지 않는다.
  return new Response(null, { status: 204 });
}

type TrackBody = {
  event?: unknown;
  animalId?: unknown;
  answers?: unknown;
  section?: unknown;
};

export async function POST(req: Request): Promise<Response> {
  // 어떤 경우에도 클라이언트엔 204. 검증 실패·Firestore 불가는 조용히 무시한다.
  try {
    const body = (await req.json().catch(() => null)) as TrackBody | null;
    if (!body || typeof body.event !== "string") return noContent();

    const db = getDb();
    if (!db) return noContent(); // 로컬/빌드: 자격증명 없음 → no-op

    const updates: Record<string, FirebaseFirestore.FieldValue> = {};
    const inc = () => FieldValue.increment(1);

    const animalId =
      typeof body.animalId === "string" && ANIMAL_IDS.has(body.animalId)
        ? body.animalId
        : null;

    switch (body.event) {
      case "start": {
        updates["starts"] = inc();
        break;
      }
      case "complete": {
        updates["completes"] = inc();
        if (animalId) updates[`result.${animalId}`] = inc();
        // answers: index=문항i, 값=선택지i. 길이 ≤17 캡, qi/ci 범위 검증.
        if (Array.isArray(body.answers)) {
          const answers = body.answers.slice(0, NUM_QUESTIONS);
          answers.forEach((ci, qi) => {
            if (
              typeof ci === "number" &&
              Number.isInteger(ci) &&
              qi >= 0 &&
              qi < NUM_QUESTIONS &&
              ci >= 0 &&
              ci < MAX_CHOICES
            ) {
              updates[`q.${qi}.${ci}`] = inc();
            }
          });
        }
        break;
      }
      case "share": {
        updates["shares"] = inc();
        if (animalId) updates[`shareResult.${animalId}`] = inc();
        break;
      }
      case "cta": {
        const section =
          typeof body.section === "string" && SECTION_KEYS.has(body.section)
            ? body.section
            : null;
        if (section) updates[`cta.${section}`] = inc();
        if (animalId) updates[`ctaResult.${animalId}`] = inc();
        break;
      }
      default:
        return noContent(); // 알 수 없는 이벤트 무시
    }

    if (Object.keys(updates).length === 0) return noContent();

    // 단일 update — 문서가 없으면 set(merge) 로 생성, 있으면 increment 누적.
    await db
      .doc(STATS_DOC)
      .set(updates, { merge: true })
      .catch(() => {});
  } catch {
    // 어떤 오류도 클라이언트로 던지지 않는다.
  }
  return noContent();
}

/* ── 임시 진단(GET ?diag=ds-diag-7x) — 통계 미적재 원인 파악용. 확인 후 제거. ──
   실행 중인 서비스계정·프로젝트·Firestore 쓰기 에러를 그대로 노출한다. */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (url.searchParams.get("diag") !== "ds-diag-7x") {
    return new Response("not found", { status: 404 });
  }
  const out: Record<string, unknown> = {
    env: {
      GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT ?? null,
      GCLOUD_PROJECT: process.env.GCLOUD_PROJECT ?? null,
      FIREBASE_CONFIG: process.env.FIREBASE_CONFIG ? "(set)" : null,
    },
  };

  try {
    const r = await fetch(
      "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email",
      { headers: { "Metadata-Flavor": "Google" } },
    );
    out.runtimeServiceAccount = r.ok ? await r.text() : `metadata ${r.status}`;
  } catch (e) {
    out.runtimeServiceAccount = `metadata error: ${(e as Error).message}`;
  }

  const db = getDb();
  out.dbNull = db === null;
  if (db) {
    try {
      await db
        .doc(STATS_DOC)
        .set({ _diag: FieldValue.increment(1) }, { merge: true });
      const snap = await db.doc(STATS_DOC).get();
      out.writeOk = true;
      out.docExists = snap.exists;
      out.diagValue = snap.get("_diag") ?? null;
    } catch (e) {
      out.writeOk = false;
      out.writeError = `${(e as Error).name}: ${(e as Error).message}`;
    }
  }

  return new Response(JSON.stringify(out, null, 2), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
