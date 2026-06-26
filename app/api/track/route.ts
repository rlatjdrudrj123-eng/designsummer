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

    // 중첩 객체로 쌓는다 — Firestore set(merge)는 점(.) 문자열 키를 통짜 필드명으로
    // 저장하므로(중첩 경로 X), result/q/cta 는 반드시 실제 중첩 객체로 만들어야
    // 대시보드(data.result.{id}, data.q.{qi}.{ci})가 읽을 수 있다.
    const updates: Record<string, unknown> = {};
    const inc = () => FieldValue.increment(1);

    const animalId =
      typeof body.animalId === "string" && ANIMAL_IDS.has(body.animalId)
        ? body.animalId
        : null;

    switch (body.event) {
      case "start": {
        updates.starts = inc();
        break;
      }
      case "complete": {
        updates.completes = inc();
        if (animalId) updates.result = { [animalId]: inc() };
        // answers: index=문항i, 값=선택지i. 길이 ≤17 캡, qi/ci 범위 검증.
        if (Array.isArray(body.answers)) {
          const answers = body.answers.slice(0, NUM_QUESTIONS);
          const q: Record<string, Record<string, FirebaseFirestore.FieldValue>> =
            {};
          answers.forEach((ci, qi) => {
            if (
              typeof ci === "number" &&
              Number.isInteger(ci) &&
              qi >= 0 &&
              qi < NUM_QUESTIONS &&
              ci >= 0 &&
              ci < MAX_CHOICES
            ) {
              q[String(qi)] = { [String(ci)]: inc() };
            }
          });
          if (Object.keys(q).length > 0) updates.q = q;
        }
        break;
      }
      case "share": {
        updates.shares = inc();
        if (animalId) updates.shareResult = { [animalId]: inc() };
        break;
      }
      case "cta": {
        const section =
          typeof body.section === "string" && SECTION_KEYS.has(body.section)
            ? body.section
            : null;
        if (section) updates.cta = { [section]: inc() };
        if (animalId) updates.ctaResult = { [animalId]: inc() };
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
