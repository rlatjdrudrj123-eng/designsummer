import "server-only";
import { getDb } from "@/lib/firebaseAdmin";
import { QUESTIONS } from "@/lib/animalTest";
import type { TeaserPoll } from "@/components/aura/AnimalTest";

export type { TeaserPoll };

/* 테스트 진입부 미리보기 폴(문항+실시간 응답률).
   Firestore stats/auraTest 의 q.{qi}.{ci} 분포에서 추린다. 문항·보기 텍스트는
   lib/animalTest QUESTIONS 원문 그대로(카피 수정 없음), 숫자만 라이브.
   홈이 force-dynamic 이라 요청마다 불리므로 인스턴스 메모리 60초 캐시.
   표본 부족(완료 30건 미만)·Firestore 불가 시 null → 미표시. */

// 노출할 문항(0-index): Q10(AI 얘기 들었을 때), Q4(형용사 지옥 피드백)
// — 응답이 팽팽하게 갈리는 문항일수록 '내 답은?' 심리를 자극(어그로·밈).
const FEATURED_QI = [9, 3];
const MIN_COMPLETES = 30;
const TTL_MS = 60_000;
let memo: { at: number; data: TeaserPoll[] | null } | null = null;

export async function getTeaserPolls(): Promise<TeaserPoll[] | null> {
  const now = Date.now();
  if (memo && now - memo.at < TTL_MS) return memo.data;

  let data: TeaserPoll[] | null = null;
  const db = getDb();
  if (db) {
    try {
      const snap = await db.doc("stats/auraTest").get();
      const d = snap.data() as
        | {
            completes?: number;
            q?: Record<string, Record<string, number>>;
          }
        | undefined;
      if ((d?.completes ?? 0) >= MIN_COMPLETES && d?.q) {
        const polls: TeaserPoll[] = [];
        for (const qi of FEATURED_QI) {
          const question = QUESTIONS[qi];
          const dist = d.q[String(qi)] ?? {};
          const counts = question.choices.map((_, ci) => dist[String(ci)] ?? 0);
          const total = counts.reduce((s, n) => s + n, 0);
          if (total < MIN_COMPLETES) continue;
          const maxN = Math.max(...counts);
          polls.push({
            q: question.q,
            options: question.choices.map((c, ci) => ({
              label: c.label,
              pct: ((counts[ci] / total) * 100).toFixed(1),
              top: counts[ci] === maxN && maxN > 0,
            })),
          });
        }
        if (polls.length > 0) data = polls;
      }
    } catch {
      data = null;
    }
  }
  memo = { at: now, data };
  return data;
}
