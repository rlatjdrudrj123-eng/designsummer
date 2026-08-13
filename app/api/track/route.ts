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
import { ANIMALS, QUESTIONS, SURVEY_QUESTIONS } from "@/lib/animalTest";

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
  /* 비채점 설문(뉴스레터 설문판) — { field: number[], aware: number|null, interests: number[] } */
  survey?: unknown;
};

/* 설문 답 검증 — 옵션 범위 내 정수, 중복 제거, 최대 선택 수 캡. */
function sanitizeMulti(v: unknown, si: number): number[] {
  if (!Array.isArray(v)) return [];
  const sq = SURVEY_QUESTIONS[si];
  const seen = new Set<number>();
  for (const x of v) {
    if (
      typeof x === "number" &&
      Number.isInteger(x) &&
      x >= 0 &&
      x < sq.options.length
    ) {
      seen.add(x);
    }
    if (seen.size >= sq.max) break;
  }
  return [...seen];
}

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

    // 응답 원본 1건(complete 시) — 교차 분석(예: 분야별 응답)용 responses 컬렉션.
    let responseDoc: Record<string, unknown> | null = null;

    // v2 = 설문 개편(설문 3문항 추가) 이후 수집분 — 기존 루트 카운터(누적 전체)와
    // 같은 구조로 미러 저장해, 대시보드에서 개편 전/후를 구분해 본다.
    switch (body.event) {
      case "start": {
        updates.starts = inc();
        updates.v2 = { starts: inc() };
        break;
      }
      case "complete": {
        updates.completes = inc();
        const v2: Record<string, unknown> = { completes: inc() };
        if (animalId) {
          updates.result = { [animalId]: inc() };
          v2.result = { [animalId]: inc() };
        }
        // answers: index=문항i, 값=선택지i. 길이 캡, qi/ci 범위 검증.
        if (Array.isArray(body.answers)) {
          const answers = body.answers.slice(0, NUM_QUESTIONS);
          const q: Record<string, Record<string, FirebaseFirestore.FieldValue>> =
            {};
          const qv2: Record<
            string,
            Record<string, FirebaseFirestore.FieldValue>
          > = {};
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
              qv2[String(qi)] = { [String(ci)]: inc() };
            }
          });
          if (Object.keys(q).length > 0) {
            updates.q = q;
            v2.q = qv2;
          }
        }
        updates.v2 = v2;

        // 비채점 설문 답 — sv.{field|aware|interests}.{옵션 인덱스} 카운트.
        const sv = body.survey as
          | { field?: unknown; aware?: unknown; interests?: unknown }
          | undefined;
        if (sv && typeof sv === "object") {
          const svUpdates: Record<
            string,
            Record<string, FirebaseFirestore.FieldValue>
          > = {};
          const field = sanitizeMulti(sv.field, 0);
          if (field.length > 0) {
            svUpdates.field = Object.fromEntries(
              field.map((i) => [String(i), inc()]),
            );
          }
          if (
            typeof sv.aware === "number" &&
            Number.isInteger(sv.aware) &&
            sv.aware >= 0 &&
            sv.aware < SURVEY_QUESTIONS[1].options.length
          ) {
            svUpdates.aware = { [String(sv.aware)]: inc() };
          }
          const interests = sanitizeMulti(sv.interests, 2);
          if (interests.length > 0) {
            svUpdates.interests = Object.fromEntries(
              interests.map((i) => [String(i), inc()]),
            );
          }
          if (Object.keys(svUpdates).length > 0) updates.sv = svUpdates;
        }

        // 응답 원본 저장 — 교차 분석용(분야별 결과/응답 분포 등). 검증된 값만.
        {
          const cleanAnswers = Array.isArray(body.answers)
            ? body.answers
                .slice(0, NUM_QUESTIONS)
                .map((ci) =>
                  typeof ci === "number" &&
                  Number.isInteger(ci) &&
                  ci >= 0 &&
                  ci < MAX_CHOICES
                    ? ci
                    : null,
                )
            : null;
          const svc: { field?: unknown; aware?: unknown; interests?: unknown } =
            sv && typeof sv === "object" ? sv : {};
          responseDoc = {
            t: FieldValue.serverTimestamp(),
            animalId: animalId ?? null,
            answers: cleanAnswers,
            sv: {
              field: sanitizeMulti(svc.field, 0),
              aware:
                typeof svc.aware === "number" &&
                Number.isInteger(svc.aware) &&
                svc.aware >= 0 &&
                svc.aware < SURVEY_QUESTIONS[1].options.length
                  ? svc.aware
                  : null,
              interests: sanitizeMulti(svc.interests, 2),
            },
          };
        }
        break;
      }
      case "share": {
        updates.shares = inc();
        updates.v2 = { shares: inc() };
        if (animalId) updates.shareResult = { [animalId]: inc() };
        break;
      }
      case "cta": {
        const section =
          typeof body.section === "string" && SECTION_KEYS.has(body.section)
            ? body.section
            : null;
        if (section) {
          updates.cta = { [section]: inc() };
          updates.v2 = { cta: { [section]: inc() } };
        }
        if (animalId) updates.ctaResult = { [animalId]: inc() };
        break;
      }
      default:
        return noContent(); // 알 수 없는 이벤트 무시
    }

    if (Object.keys(updates).length === 0) return noContent();

    // 카운터 update(문서 없으면 set-merge 생성) + complete 면 응답 원본 add.
    const writes: Promise<unknown>[] = [
      db.doc(STATS_DOC).set(updates, { merge: true }).catch(() => {}),
    ];
    if (responseDoc) {
      writes.push(db.collection("responses").add(responseDoc).catch(() => {}));
    }
    await Promise.all(writes);
  } catch {
    // 어떤 오류도 클라이언트로 던지지 않는다.
  }
  return noContent();
}
