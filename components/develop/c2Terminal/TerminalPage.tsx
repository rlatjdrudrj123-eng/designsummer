import {
  siteContent,
  speakers,
  speakersByDay,
  formatDate,
  type Speaker,
} from "@/lib/content";
import { imageUrl } from "@/lib/images";
import { terminalMono } from "./terminalFont";
import HeatGauge from "./HeatGauge";
import Cursor from "./Cursor";
import SpeakerRow from "./SpeakerRow";
import TerminalAbout from "./TerminalAbout";
import TerminalAudience from "./TerminalAudience";
import TerminalBenefits from "./TerminalBenefits";
import TerminalFaq from "./TerminalFaq";
import Hero from "../Hero";
import PostHeroRegion from "../PostHeroRegion";
import Timetable from "../Timetable";
import Directions from "../Directions";
import Apply from "../Apply";
import Footer from "../Footer";
import styles from "./TerminalPage.module.css";

/* ─────────────────────────────────────────────────────────────────────────
 * CONCEPT 02 — THERMAL TERMINAL (REWORK)
 *
 * The KV is KEPT IDENTICAL: this reuses the develop <Hero/> (warm heat-field
 * KV) and the ONE continuous warm Aura ground (PostHeroRegion → PostHeroAura,
 * warm Day1→Day2 drift). There is NO dark/black background and NO replacement
 * KV — the page sits on the SAME luminous warm field as every other variant.
 *
 * The "terminal / data console" identity is expressed ONLY through FONT +
 * LAYOUT + METHOD on that warm ground:
 *   · FONT   — scoped JetBrains Mono (terminalFont.ts), warm dark ink (legible)
 *   · LAYOUT — an intro/concept block read as a console boot/log, the lineup
 *              as monospace "records" (session-log rows w/ labels, expandable),
 *              spec tables, terminal-style meta / kickers ("// …", "$ …").
 *   · METHOD — a per-speaker °C heat-metric motif + the Canvas2D HeatGauge,
 *              tuned to read warm-on-light rather than amber-on-black.
 *
 * SCHEDULE / VENUE / APPLY / FOOTER reuse the shared develop sections so they
 * stay identical to the main site. Self-contained edits live only under
 * components/develop/c2Terminal/.
 * ──────────────────────────────────────────────────────────────────────── */

const CONCEPT_DESC =
  "KV·오라는 그대로, 콘솔/로그 어휘로 다시 쓴 데이터 리드아웃 — 페이지 고유 카피";

/* ── TERMINAL-VOICE COPY (this page's own register) ───────────────────────
 * The director asked every concept page to read DIFFERENTLY. So this page no
 * longer pulls the shared "HEAT SOURCE / 열원 · HEAT TRANSFER / 전사" concept
 * block (siteContent.concept.*). Instead the two days are reframed as DATA
 * PARTITIONS in a system/log voice, and section copy is rewritten as readouts.
 *
 * Director-requested design copy only — NO invented facts/stats. Every hard
 * fact (speakers, dates, venue, capacity, host, applyUrl, the site intro
 * lead/body/title) is still read verbatim from @/lib/content. The °C motif is
 * kept as a data gimmick, not as the 열원/전사 concept copy. */
const DAY_LOG = {
  1: {
    part: "PARTITION 0x01",
    name: "INTAKE",
    // monospace technical descriptor (design copy, not a fact claim)
    descriptor: "fn intake() → 원천 데이터 적재",
    title: "// 분야별 소스를 콘솔에 적재하는 구간",
    body: "인쇄·타이포그래피, 브랜딩, 모션그래픽, AI 시대의 디자인까지 — 각 분야의 실무 신호를 한 줄씩 로드합니다. 행을 펼쳐 레코드 전체를 조회하십시오.",
    cmd: "load --partition 01 --records",
    status: "MOUNTED",
    chips: [
      "module/print-type",
      "module/brand",
      "module/motion",
      "module/ai-design",
    ],
  },
  2: {
    part: "PARTITION 0x02",
    name: "TRANSFER",
    descriptor: "fn transfer() → 실물 파이프라인 기록",
    title: "// 데이터가 매체·환경으로 출력되는 구간",
    body: "여러 매체와 환경을 넘나드는 적용 사례, 그리고 한 단계 진화한 비주얼 전략을 깊이 있게 기록합니다. 행을 펼쳐 레코드 전체를 조회하십시오.",
    cmd: "flush --partition 02 --records",
    status: "PIPED",
    chips: [
      "module/multi-media",
      "module/space-env",
      "module/strategy",
      "module/case-study",
    ],
  },
} as const;

/* deterministic per-speaker "heat" metric for the temperature motif.
 * derived from id chars so it's stable across SSR/CSR, range ~72..98. */
function heatOf(s: Speaker): number {
  let n = 0;
  for (const ch of s.id) n = (n + ch.charCodeAt(0)) % 100;
  return 72 + (n % 27);
}

/* The monospace DATA block that carries the console identity on the warm aura:
 * a day reframed as a data PARTITION (terminal voice) + lineup as records. */
function DayLog({ day }: { day: 1 | 2 }) {
  const list = speakersByDay(day);
  const log = DAY_LOG[day];
  const date = formatDate(siteContent.dates[day - 1]);

  return (
    <section
      id={`day${day}`}
      className={`${styles.day} shell`}
      aria-labelledby={`day-${day}-h`}
    >
      <div className={styles.dayInner}>
        <div className={styles.dayHead}>
          <div className={styles.dayMark}>
            <span className={styles.dayTag}>DAY 0{day}</span>
            <span className={styles.dayDate}>
              {date.md}
              <span className={styles.dayDow}>({date.dow})</span>
            </span>
          </div>
          <div className={styles.dayConcept}>
            <h3 id={`day-${day}-h`} className={styles.dayEn}>
              {log.part}
              <span className={styles.dayKo}>{log.name}</span>
            </h3>
            <p className={styles.dayTitle}>{log.descriptor}</p>
          </div>
        </div>

        <p className={styles.dayBody}>
          <span className={styles.dayBodyHead}>{log.title}</span>
          {log.body}
        </p>

        <ul className={styles.tags}>
          {log.chips.map((t) => (
            <li key={t} className={styles.tagItem}>
              {t}
            </li>
          ))}
        </ul>

        {/* lineup as a console session log on the warm ground */}
        <div className={styles.log}>
          <div className={styles.logBar}>
            <span className={styles.logCmd}>
              $ {log.cmd} {list.length}
            </span>
            <span className={styles.logBarRight}>STATUS: {log.status}</span>
          </div>
          <div className={styles.logCols} aria-hidden="true">
            <span>REC.ID</span>
            <span>NODE · SESSION</span>
            <span>SLOT · °C</span>
          </div>
          {list.map((s) => (
            <SpeakerRow
              key={s.id}
              speaker={s}
              heat={heatOf(s)}
              photo={imageUrl(s.imageKey)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function TerminalPage() {
  const d1 = formatDate(siteContent.dates[0]);
  const d2 = formatDate(siteContent.dates[1]);

  return (
    <main className={`${terminalMono.variable} ${styles.root}`}>
      {/* concept chip (required) — kept, restyled to read on the warm ground */}
      <aside className={styles.conceptChip} aria-label="concept">
        <span className={styles.chipDot} />
        <span className={styles.chipText}>
          <strong>Concept 02 — Thermal Terminal</strong>
          <span className={styles.chipDesc}>{CONCEPT_DESC}</span>
        </span>
      </aside>

      {/* ── KV: reuse the develop warm heat-field hero, unchanged ── */}
      <Hero />

      {/* ── everything below the hero on the ONE continuous warm Aura ground ──
          PostHeroRegion mounts a single PostHeroAura field (warm Day1→Day2
          drift) behind transparent content; our monospace data layout floats
          on top in warm dark ink. */}
      <PostHeroRegion>
        {/* console "boot" readout — the data/terminal voice, on the warm aura */}
        <section className={`${styles.intro} shell`} aria-labelledby="intro-h">
          <div className={styles.introInner}>
            <p className={styles.prompt}>
              <span className={styles.promptCaret}>thermal@kprint:~$</span> mount
              session-index --edition {siteContent.edition}
              <Cursor />
            </p>
            <p className={styles.indexLine}>
              SESSION INDEX · {speakers.length} RECORDS · 2 PARTITIONS · STATUS
              READY
            </p>
            <h2 id="intro-h" className={styles.introTitle}>
              {siteContent.title}
              <span className={styles.introEn}>
                DATASET: DESIGN-SUMMER/{siteContent.edition}
              </span>
            </h2>
            <p className={styles.lead}>{siteContent.intro.lead}</p>
            <p className={styles.body}>{siteContent.intro.body}</p>

            <div className={styles.gaugeWrap}>
              <HeatGauge target={92} label="INDEX LOAD · CORE °C" unit="°C" />
            </div>

            <dl className={styles.specs}>
              <div className={styles.spec}>
                <dt>// RANGE</dt>
                <dd>
                  {d1.md}({d1.dow})–{d2.md}({d2.dow})
                </dd>
              </div>
              <div className={styles.spec}>
                <dt>// NODE</dt>
                <dd>{siteContent.venue}</dd>
              </div>
              <div className={styles.spec}>
                <dt>// ALLOC</dt>
                <dd>{siteContent.capacity}</dd>
              </div>
              <div className={styles.spec}>
                <dt>// RECORDS</dt>
                <dd>{speakers.length}</dd>
              </div>
            </dl>

            <p className={styles.host}>
              <span className={styles.hostKey}>$ whoami →</span>{" "}
              {siteContent.host}
            </p>
          </div>
        </section>

        {/* ── ABOUT (행사 개요) — console readout from conference.about ── */}
        <TerminalAbout />

        {/* ── AUDIENCE (추천 대상) — record lists from conference.audience ── */}
        <TerminalAudience />

        {/* ── DAY LOGS (concept + lineup as session-log records) ── */}
        <DayLog day={1} />
        <DayLog day={2} />

        {/* ── SCHEDULE — shared develop section ── */}
        <Timetable />

        {/* ── BENEFITS (혜택) — console list from conference.benefits ── */}
        <TerminalBenefits />

        {/* ── VENUE — shared develop section ── */}
        <Directions />

        {/* ── FAQ — query/response log from conference.faq ── */}
        <TerminalFaq />

        {/* ── APPLY / FOOTER — shared develop sections ── */}
        <Apply />
        <Footer />
      </PostHeroRegion>
    </main>
  );
}
