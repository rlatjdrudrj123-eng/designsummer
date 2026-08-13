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
import {
  ANIMALS,
  SWAN,
  QUESTIONS,
  SURVEY_QUESTIONS,
  type AnimalId,
} from "@/lib/animalTest";

export const dynamic = "force-dynamic";
export const metadata = { title: "테스트 통계 · Design Summer" };

/* Firestore 문서 형태 — 모두 optional(없으면 0).
   루트 = 누적 전체, v2 = 설문 개편(설문 3문항 추가) 이후 수집분 미러,
   sv = 비채점 설문 답 분포(개편 이후에만 존재). */
type StatsView = {
  starts?: number;
  completes?: number;
  shares?: number;
  cta?: Partial<Record<"A" | "B" | "K", number>>;
  result?: Partial<Record<string, number>>;
  q?: Record<string, Record<string, number>>;
};
type StatsDoc = StatsView & {
  shareResult?: Partial<Record<string, number>>;
  ctaResult?: Partial<Record<string, number>>;
  v2?: StatsView;
  sv?: Partial<
    Record<"field" | "aware" | "interests", Record<string, number>>
  >;
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

/* ── 분야별 교차 분석 — responses(응답 원본, 개편 이후) 컬렉션 기반 ──────────
   선택한 분야를 고른 응답만 모아 결과/설문/문항 분포를 재계산한다. */
type CrossAgg = {
  n: number;
  result: Record<string, number>;
  aware: Record<string, number>;
  interests: Record<string, number>;
  q: Record<string, Record<string, number>>;
};

async function loadFieldCross(fieldIdx: number): Promise<CrossAgg | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const snap = await db
      .collection("responses")
      .where("sv.field", "array-contains", fieldIdx)
      .limit(2000)
      .get();
    const agg: CrossAgg = { n: 0, result: {}, aware: {}, interests: {}, q: {} };
    snap.forEach((doc) => {
      const r = doc.data() as {
        animalId?: string | null;
        answers?: (number | null)[] | null;
        sv?: { aware?: number | null; interests?: number[] };
      };
      agg.n += 1;
      if (typeof r.animalId === "string") {
        agg.result[r.animalId] = (agg.result[r.animalId] ?? 0) + 1;
      }
      const aw = r.sv?.aware;
      if (typeof aw === "number") {
        agg.aware[String(aw)] = (agg.aware[String(aw)] ?? 0) + 1;
      }
      for (const i of r.sv?.interests ?? []) {
        agg.interests[String(i)] = (agg.interests[String(i)] ?? 0) + 1;
      }
      (r.answers ?? []).forEach((ci, qi) => {
        if (typeof ci !== "number") return;
        const qk = String(qi);
        agg.q[qk] = agg.q[qk] ?? {};
        agg.q[qk][String(ci)] = (agg.q[qk][String(ci)] ?? 0) + 1;
      });
    });
    return agg;
  } catch {
    return null;
  }
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
  // era: all = 누적 전체(개편 전+후), v2 = 설문 개편 이후만.
  const era = sp.era === "v2" ? "v2" : "all";

  const { data, available } = await loadStats();
  const view: StatsView = era === "v2" ? (data.v2 ?? {}) : data;

  const starts = view.starts ?? 0;
  const completes = view.completes ?? 0;
  const shares = view.shares ?? 0;
  const ctaA = view.cta?.A ?? 0;
  const ctaB = view.cta?.B ?? 0;
  const ctaK = view.cta?.K ?? 0;

  const result = view.result ?? {};
  const totalResults = ANIMAL_ORDER.reduce((s, id) => s + (result[id] ?? 0), 0);

  // 설문(비채점) — 개편 이후에만 존재. 응답자 수 = v2 완료 수.
  const sv = data.sv ?? {};
  const svRespondents = data.v2?.completes ?? 0;

  // 분야별 교차 분석 — ?field=0..6
  const fieldRaw = typeof sp.field === "string" ? parseInt(sp.field, 10) : NaN;
  const fieldIdx =
    Number.isInteger(fieldRaw) &&
    fieldRaw >= 0 &&
    fieldRaw < SURVEY_QUESTIONS[0].options.length
      ? fieldRaw
      : null;
  const cross = fieldIdx !== null ? await loadFieldCross(fieldIdx) : null;
  const eraQs = era === "v2" ? "era=v2&" : "";

  const funnel = [
    { label: "시작", value: starts },
    { label: "완료", value: completes },
    { label: "완료율", value: pct(completes, starts), isText: true },
    { label: "공유", value: shares },
    { label: "CTA · section A", value: ctaA },
    { label: "CTA · section B", value: ctaB },
    { label: "CTA · K-PRINT", value: ctaK },
  ];

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h1 className={styles.title}>Design Summer · 테스트 통계</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className={styles.logout} href="/admin/contacts">
            쿠폰 응모자 →
          </Link>
          <Link className={styles.logout} href="/admin">
            ← 이미지 관리
          </Link>
        </div>
      </header>

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

      {/* ── 기간 전환 — 누적 전체 vs 설문 개편(설문 3문항 추가) 이후 ── */}
      <div style={{ display: "flex", gap: 8, margin: "14px 0 4px" }}>
        {(
          [
            ["all", "누적 전체"],
            ["v2", "설문 개편 이후"],
          ] as const
        ).map(([key, label]) => (
          <Link
            key={key}
            href={key === "all" ? "/admin/stats" : "/admin/stats?era=v2"}
            className={styles.logout}
            style={
              era === key
                ? { background: "#1a1310", color: "#fff", borderColor: "#1a1310" }
                : undefined
            }
          >
            {label}
          </Link>
        ))}
      </div>
      {era === "v2" && (
        <p className={styles.note}>
          설문 3문항(분야·인지·관심)이 추가된 개편 이후 수집분만 표시 중입니다.
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
              (_, ci) => view.q?.[String(qi)]?.[String(ci)] ?? 0,
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

      {/* ── 설문 응답(비채점) — 개편 이후 수집분에만 존재 ────────────────── */}
      <section className={styles.group}>
        <div className={styles.groupHead}>
          <h2 className={styles.groupTitle}>설문 응답</h2>
          <span className={styles.groupHint}>
            개편 이후 응답자 {svRespondents.toLocaleString()}명 기준 · 복수선택
            문항은 합계가 100%를 넘을 수 있음
          </span>
        </div>
        <div className={styles.qList}>
          {SURVEY_QUESTIONS.map((sq) => {
            const dist = sv[sq.id] ?? {};
            const counts = sq.options.map((_, i) => dist[String(i)] ?? 0);
            // 단일 선택은 그 문항 응답 합, 복수선택은 응답자 수를 분모로.
            const denom = sq.multi
              ? svRespondents
              : counts.reduce((s, c) => s + c, 0);
            return (
              <div key={sq.id} className={styles.qBlock}>
                <p className={styles.qTitle}>
                  {sq.q}
                  {sq.hint && <span className={styles.qTotal}>{sq.hint}</span>}
                </p>
                <div className={styles.barList}>
                  {sq.options.map((label, i) => {
                    const n = counts[i];
                    return (
                      <div key={i} className={styles.barRow}>
                        <span className={styles.barName}>{label}</span>
                        <span className={styles.barTrack}>
                          <span
                            className={styles.barFill}
                            style={{ width: pct(n, denom) }}
                          />
                        </span>
                        <span className={styles.barNum}>
                          {n.toLocaleString()} · {pct(n, denom)}
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

      {/* ── 분야별 교차 분석 — "이 분야 디자이너들은 이렇게 응답했다" ──────── */}
      <section className={styles.group}>
        <div className={styles.groupHead}>
          <h2 className={styles.groupTitle}>분야별 교차 분석</h2>
          <span className={styles.groupHint}>
            응답 원본 기반 · 설문 개편 이후 응답만 집계
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SURVEY_QUESTIONS[0].options.map((label, i) => (
            <Link
              key={i}
              href={`/admin/stats?${eraQs}field=${i}`}
              className={styles.logout}
              style={
                fieldIdx === i
                  ? {
                      background: "#1a1310",
                      color: "#fff",
                      borderColor: "#1a1310",
                    }
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
          {fieldIdx !== null && (
            <Link
              href={era === "v2" ? "/admin/stats?era=v2" : "/admin/stats"}
              className={styles.logout}
            >
              ✕ 해제
            </Link>
          )}
        </div>

        {fieldIdx === null ? (
          <p className={styles.note}>
            분야를 선택하면 그 분야를 고른 응답자들의 결과·설문·문항 분포를
            보여줍니다.
          </p>
        ) : !cross || cross.n === 0 ? (
          <p className={styles.note}>
            ‘{SURVEY_QUESTIONS[0].options[fieldIdx]}’ 분야를 고른 응답이 아직
            없습니다.
          </p>
        ) : (
          <>
            <p className={styles.note}>
              ‘{SURVEY_QUESTIONS[0].options[fieldIdx]}’ 선택 응답자{" "}
              {cross.n.toLocaleString()}명 기준
            </p>

            {/* 결과 동물 분포 */}
            <div className={styles.qBlock}>
              <p className={styles.qTitle}>결과 동물 분포</p>
              <div className={styles.barList}>
                {ANIMAL_ORDER.map((id) => {
                  const n = cross.result[id] ?? 0;
                  return (
                    <div key={id} className={styles.barRow}>
                      <span className={styles.barName}>
                        {ANIMAL_EMOJI[id]} {ANIMAL_NAME[id]}
                      </span>
                      <span className={styles.barTrack}>
                        <span
                          className={styles.barFill}
                          style={{ width: pct(n, cross.n) }}
                        />
                      </span>
                      <span className={styles.barNum}>
                        {n.toLocaleString()} · {pct(n, cross.n)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 설문(인지·관심) 분포 */}
            {([1, 2] as const).map((si) => {
              const sq = SURVEY_QUESTIONS[si];
              const dist = si === 1 ? cross.aware : cross.interests;
              const counts = sq.options.map((_, i) => dist[String(i)] ?? 0);
              const denom = sq.multi
                ? cross.n
                : counts.reduce((s, c) => s + c, 0);
              return (
                <div key={sq.id} className={styles.qBlock}>
                  <p className={styles.qTitle}>
                    {sq.q}
                    {sq.hint && (
                      <span className={styles.qTotal}>{sq.hint}</span>
                    )}
                  </p>
                  <div className={styles.barList}>
                    {sq.options.map((label, i) => (
                      <div key={i} className={styles.barRow}>
                        <span className={styles.barName}>{label}</span>
                        <span className={styles.barTrack}>
                          <span
                            className={styles.barFill}
                            style={{ width: pct(counts[i], denom) }}
                          />
                        </span>
                        <span className={styles.barNum}>
                          {counts[i].toLocaleString()} · {pct(counts[i], denom)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* 문항별 선택 분포 */}
            {QUESTIONS.map((question, qi) => {
              const counts = question.choices.map(
                (_, ci) => cross.q[String(qi)]?.[String(ci)] ?? 0,
              );
              const qTotal = counts.reduce((s, c) => s + c, 0);
              return (
                <div key={qi} className={styles.qBlock}>
                  <p className={styles.qTitle}>
                    Q{qi + 1}. {question.q}
                    <span className={styles.qTotal}>
                      응답 {qTotal.toLocaleString()}
                    </span>
                  </p>
                  <div className={styles.barList}>
                    {question.choices.map((c, ci) => (
                      <div key={ci} className={styles.barRow}>
                        <span className={styles.barName}>{c.label}</span>
                        <span className={styles.barTrack}>
                          <span
                            className={styles.barFill}
                            style={{ width: pct(counts[ci], qTotal) }}
                          />
                        </span>
                        <span className={styles.barNum}>
                          {counts[ci].toLocaleString()} ·{" "}
                          {pct(counts[ci], qTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </section>
    </div>
  );
}
