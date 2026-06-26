/* ============================================================================
 * /admin/stats — 동물상 테스트 자체 통계 (서버 컴포넌트).
 *
 * 미들웨어(middleware.ts, matcher /admin/:path*)가 인증을 강제하므로 이 페이지는
 * 어드민 세션 없이는 도달할 수 없다(미인증 → /admin/login 리다이렉트).
 *
 * Firestore stats/auraTest 1회 read 후 렌더: 퍼널 / 결과 동물 분포 / 문항별 선택
 * 분포. 데이터 없음·Firestore 불가(getDb()===null)면 0/안내 문구로 graceful.
 * ========================================================================== */

import Link from "next/link";
import styles from "../admin.module.css";
import { getDb } from "@/lib/firebaseAdmin";
import { ANIMALS, SWAN, QUESTIONS, type AnimalId } from "@/lib/animalTest";

export const dynamic = "force-dynamic";
export const metadata = { title: "테스트 통계 · Design Summer" };

/* Firestore 문서 형태 — 모두 optional(없으면 0). */
type StatsDoc = {
  starts?: number;
  completes?: number;
  shares?: number;
  cta?: Partial<Record<"A" | "B", number>>;
  result?: Partial<Record<string, number>>;
  shareResult?: Partial<Record<string, number>>;
  ctaResult?: Partial<Record<string, number>>;
  q?: Record<string, Record<string, number>>;
};

async function loadStats(): Promise<{ data: StatsDoc; available: boolean }> {
  const db = getDb();
  if (!db) return { data: {}, available: false };
  try {
    const snap = await db.doc("stats/auraTest").get();
    return { data: (snap.data() as StatsDoc) ?? {}, available: true };
  } catch {
    return { data: {}, available: false };
  }
}

function pct(n: number, total: number): string {
  if (!total) return "0%";
  return `${((n / total) * 100).toFixed(1)}%`;
}

/* 동물 이름 — 메인 9종은 ANIMALS, 백조는 SWAN. */
const ANIMAL_NAME: Record<AnimalId, string> = {
  alpaca: ANIMALS.alpaca.name,
  sloth: ANIMALS.sloth.name,
  owl: ANIMALS.owl.name,
  cat: ANIMALS.cat.name,
  dog: ANIMALS.dog.name,
  chameleon: ANIMALS.chameleon.name,
  otter: ANIMALS.otter.name,
  fox: ANIMALS.fox.name,
  tiger: ANIMALS.tiger.name,
  swan: SWAN.name,
};
const ANIMAL_EMOJI: Record<AnimalId, string> = {
  alpaca: ANIMALS.alpaca.emoji,
  sloth: ANIMALS.sloth.emoji,
  owl: ANIMALS.owl.emoji,
  cat: ANIMALS.cat.emoji,
  dog: ANIMALS.dog.emoji,
  chameleon: ANIMALS.chameleon.emoji,
  otter: ANIMALS.otter.emoji,
  fox: ANIMALS.fox.emoji,
  tiger: ANIMALS.tiger.emoji,
  swan: SWAN.emoji,
};
const ANIMAL_ORDER: AnimalId[] = [
  "alpaca",
  "sloth",
  "owl",
  "cat",
  "dog",
  "chameleon",
  "otter",
  "fox",
  "tiger",
  "swan",
];

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const resetMsg =
    sp.reset === "1"
      ? { ok: true, msg: "통계를 초기화했어요. 다음 참여부터 새로 집계됩니다." }
      : sp.reset === "err"
        ? { ok: false, msg: "초기화 실패 — 잠시 후 다시 시도해주세요." }
        : null;

  const { data, available } = await loadStats();

  const starts = data.starts ?? 0;
  const completes = data.completes ?? 0;
  const shares = data.shares ?? 0;
  const ctaA = data.cta?.A ?? 0;
  const ctaB = data.cta?.B ?? 0;

  const result = data.result ?? {};
  const totalResults = ANIMAL_ORDER.reduce((s, id) => s + (result[id] ?? 0), 0);

  const funnel = [
    { label: "시작", value: starts },
    { label: "완료", value: completes },
    { label: "완료율", value: pct(completes, starts), isText: true },
    { label: "공유", value: shares },
    { label: "CTA · section A", value: ctaA },
    { label: "CTA · section B", value: ctaB },
  ];

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h1 className={styles.title}>Design Summer · 테스트 통계</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <form method="post" action="/api/admin/stats-reset">
            <button
              className={styles.logout}
              type="submit"
              style={{ color: "#c43d1c", borderColor: "#c43d1c" }}
            >
              통계 초기화
            </button>
          </form>
          <Link className={styles.logout} href="/admin">
            ← 이미지 관리
          </Link>
        </div>
      </header>

      {resetMsg && (
        <p
          className={styles.note}
          style={{
            borderLeft: `3px solid ${resetMsg.ok ? "#2f8f4e" : "#c43d1c"}`,
            paddingLeft: 10,
            color: resetMsg.ok ? "#2f8f4e" : "#c43d1c",
            fontWeight: 600,
          }}
        >
          {resetMsg.msg}
        </p>
      )}

      {!available ? (
        <p className={styles.note}>
          Firestore 에 연결할 수 없어 통계를 불러오지 못했습니다(로컬 환경이거나
          서비스 계정 권한이 없을 수 있음). 아래 수치는 0 으로 표시됩니다.
        </p>
      ) : (
        <p className={styles.note}>
          동물상 테스트의 자체 수집 통계입니다(Firestore <code>stats/auraTest</code>).
          공개 수집 API 라 일부 수치엔 노이즈가 섞일 수 있습니다.
        </p>
      )}

      {/* ── 퍼널 ─────────────────────────────────────────────────────────── */}
      <section className={styles.group}>
        <div className={styles.groupHead}>
          <h2 className={styles.groupTitle}>퍼널</h2>
          <span className={styles.groupHint}>시작 → 완료 → 공유 / CTA</span>
        </div>
        <div className={styles.statGrid}>
          {funnel.map((f) => (
            <div key={f.label} className={styles.statCard}>
              <span className={styles.statValue}>
                {f.isText ? f.value : (f.value as number).toLocaleString()}
              </span>
              <span className={styles.statLabel}>{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 결과 동물 분포 ──────────────────────────────────────────────── */}
      <section className={styles.group}>
        <div className={styles.groupHead}>
          <h2 className={styles.groupTitle}>결과 동물 분포</h2>
          <span className={styles.groupHint}>총 {totalResults.toLocaleString()}건</span>
        </div>
        <div className={styles.barList}>
          {ANIMAL_ORDER.map((id) => {
            const n = result[id] ?? 0;
            return (
              <div key={id} className={styles.barRow}>
                <span className={styles.barName}>
                  {ANIMAL_EMOJI[id]} {ANIMAL_NAME[id]}
                </span>
                <span className={styles.barTrack}>
                  <span
                    className={styles.barFill}
                    style={{ width: pct(n, totalResults) }}
                  />
                </span>
                <span className={styles.barNum}>
                  {n.toLocaleString()} · {pct(n, totalResults)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 문항별 선택 분포 ────────────────────────────────────────────── */}
      <section className={styles.group}>
        <div className={styles.groupHead}>
          <h2 className={styles.groupTitle}>문항별 선택 분포</h2>
          <span className={styles.groupHint}>각 문항 응답자 기준 비율</span>
        </div>
        <div className={styles.qList}>
          {QUESTIONS.map((question, qi) => {
            const counts = question.choices.map(
              (_, ci) => data.q?.[String(qi)]?.[String(ci)] ?? 0,
            );
            const qTotal = counts.reduce((s, c) => s + c, 0);
            return (
              <div key={qi} className={styles.qBlock}>
                <p className={styles.qTitle}>
                  Q{qi + 1}. {question.q}
                  <span className={styles.qTotal}>응답 {qTotal.toLocaleString()}</span>
                </p>
                <div className={styles.barList}>
                  {question.choices.map((c, ci) => {
                    const n = counts[ci];
                    return (
                      <div key={ci} className={styles.barRow}>
                        <span className={styles.barName}>{c.label}</span>
                        <span className={styles.barTrack}>
                          <span
                            className={styles.barFill}
                            style={{ width: pct(n, qTotal) }}
                          />
                        </span>
                        <span className={styles.barNum}>
                          {n.toLocaleString()} · {pct(n, qTotal)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
