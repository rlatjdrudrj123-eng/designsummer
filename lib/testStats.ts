import "server-only";
import { getDb } from "@/lib/firebaseAdmin";
import { ANIMALS, SWAN, type AnimalId } from "@/lib/animalTest";
import type { LiveTestStats } from "@/components/aura/AnimalTest";

export type { LiveTestStats };

/* 동물상 테스트 라이브 통계(홈 진입부 소셜프루프용).
   Firestore stats/auraTest 1회 read → { 참여수, 1위 유형 } 요약.
   홈이 force-dynamic 이라 요청마다 불리므로 인스턴스 메모리 60초 캐시.
   표본이 너무 적거나(완료 30건 미만) Firestore 불가 시 null → 문구 미표시. */

const MIN_COMPLETES = 30;
const TTL_MS = 60_000;
let memo: { at: number; data: LiveTestStats | null } | null = null;

export async function getLiveTestStats(): Promise<LiveTestStats | null> {
  const now = Date.now();
  if (memo && now - memo.at < TTL_MS) return memo.data;

  let data: LiveTestStats | null = null;
  const db = getDb();
  if (db) {
    try {
      const snap = await db.doc("stats/auraTest").get();
      const d = snap.data() as
        | {
            starts?: number;
            completes?: number;
            result?: Partial<Record<string, number>>;
          }
        | undefined;
      const completes = d?.completes ?? 0;
      const result = d?.result ?? {};
      if (completes >= MIN_COMPLETES) {
        // 1위 유형(백조 포함) 산출
        let topId: AnimalId | null = null;
        let topN = -1;
        const ids = [...(Object.keys(ANIMALS) as AnimalId[]), "swan" as const];
        for (const id of ids) {
          const n = result[id] ?? 0;
          if (n > topN) {
            topN = n;
            topId = id;
          }
        }
        if (topId && topN > 0) {
          const a = topId === "swan" ? SWAN : ANIMALS[topId];
          data = {
            topEmoji: a.emoji,
            topName: a.name,
            topPct: ((topN / completes) * 100).toFixed(1),
          };
        }
      }
    } catch {
      data = null;
    }
  }
  memo = { at: now, data };
  return data;
}
