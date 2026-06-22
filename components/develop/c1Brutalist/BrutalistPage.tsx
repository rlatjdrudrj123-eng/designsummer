import {
  siteContent,
  speakers,
  speakersByDay,
  formatDate,
  type Speaker,
} from "@/lib/content";
import { imageUrl } from "@/lib/images";
import { conference } from "../conference";
import { archivo, spaceMono } from "./font";
import Hero from "../Hero";
import PostHeroRegion from "../PostHeroRegion";
import Timetable from "../Timetable";
import Directions from "../Directions";
import Apply from "../Apply";
import Footer from "../Footer";
import Photo from "./Photo";
import styles from "./Brutalist.module.css";

/* ──────────────────────────────────────────────────────────────────────────
 * Concept 01 — Brutalist Grid (ON the warm Aura ground)
 *
 * The KV and the warm continuous Aura ground are KEPT IDENTICAL to the develop
 * baseline: this page reuses <Hero/> (the heat-field KV) and <PostHeroRegion/>
 * (the single drifting Day1→Day2 multi-color aura field) verbatim, and reuses
 * the shared <Timetable/> / <Directions/> / <Apply/> / <Footer/> sections.
 *
 * THIS page now renders the FULL official Design Summer 2026 conference copy
 * (components/develop/conference.ts) — About / Audience / Benefits / FAQ are
 * built HERE as brutalist sections (we do NOT import the shared About/Audience/
 * Benefits/Faq, so the page stays cohesive in the brutalist design). The
 * brutalist signature is expressed ONLY through FONT / LAYOUT / 배치 / EFFECT:
 *   - heavy grotesque display (scoped Archivo) + monospace meta (Space Mono)
 *   - a strict Swiss modular grid drawn with visible HAIRLINE rules
 *   - numbered tabular rows, hard typographic hierarchy, mono numbers
 *
 * The grid + rules are a transparent STRUCTURE laid over the warm aura: dark
 * warm ink on a fully transparent surface. No off-white / opaque paint that
 * would hide the field shows through any section.
 *
 * Composition: Hero → About → Audience → [brutalist LINEUP] → Timetable →
 * Benefits → Directions → FAQ → Apply → Footer.
 *
 * All FACTS below are verbatim from conference.ts / @/lib/content. Only short
 * structural section LABELS (00/01/… + EN heads) are authored here; NO invented
 * stats, NO altered facts.
 * ────────────────────────────────────────────────────────────────────────── */

const CONCEPT_DESC =
  "활자 우선의 스위스 그리드. 헤어라인 규칙과 단단한 위계, 모노 메타.";

const [date1, date2] = siteContent.dates;
const f1 = formatDate(date1);
const f2 = formatDate(date2);

/* brutalist systemic voice — the program read as a SYSTEM / specimen sheet.
   verbatim facts + short structural labels only. */
const SYS_LINE = `2 DAYS · ${speakers.length} SESSIONS · 1 FIELD`;

const about = conference.about;
const audience = conference.audience;
const benefits = conference.benefits;
const faq = conference.faq;
const info = conference.info;

// fact ledger — pure data, verbatim from conference.info / hero
const LEDGER: { k: string; v: string }[] = [
  { k: "PROGRAM", v: conference.hero.title },
  { k: "TAGLINE", v: conference.hero.subtitle },
  { k: "DATE", v: conference.hero.date },
  { k: "VENUE", v: conference.hero.venue },
  { k: "HOST", v: info.host },
  { k: "PRICE", v: info.price },
  { k: "SEATS", v: info.capacity },
];

function SectionHead({
  index,
  title,
  meta,
}: {
  index: string;
  title: string;
  meta?: string;
}) {
  return (
    <div className={styles.sectionHead}>
      <span className={styles.sectionIndex}>{index}</span>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {meta ? <span className={styles.sectionMeta}>{meta}</span> : null}
    </div>
  );
}

function SpeakerRow({ s, n }: { s: Speaker; n: string }) {
  const portrait = imageUrl(s.imageKey);
  const titleLines = s.sessionTitle.split("\n");
  return (
    <article className={styles.row} id={`speaker-${s.id}`}>
      <div className={styles.rowNum}>{n}</div>
      <div className={styles.rowTime}>{s.time}</div>
      <div className={styles.rowPortrait}>
        <Photo src={portrait} alt={`${s.studio} ${s.name}`} className={styles.portrait} />
      </div>
      <div className={styles.rowBody}>
        <div className={styles.rowStudio}>
          <span className={`${styles.studioEn} ${archivo.className}`}>
            {s.studioEn}
          </span>
          <span className={styles.studioKo}>{s.studio}</span>
        </div>
        <h3 className={styles.rowTitle}>
          {titleLines.map((line, i) => (
            <span key={i} className={styles.rowTitleLine}>
              {line}
            </span>
          ))}
        </h3>
        <p className={styles.rowDesc}>{s.sessionDesc}</p>
        <ul className={styles.creds}>
          {s.credentials.map((c, i) => (
            <li key={i} className={styles.cred}>
              {c}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.rowPerson}>
        <span className={styles.personName}>{s.name}</span>
        <span className={styles.personRole}>{s.role}</span>
      </div>
    </article>
  );
}

export default function BrutalistPage() {
  const d1Speakers = speakersByDay(1);
  const d2Speakers = speakersByDay(2);

  return (
    <main
      className={`${styles.page} ${archivo.variable} ${spaceMono.variable} ${archivo.className}`}
    >
      {/* fixed concept chip — required */}
      <aside className={styles.chip} aria-label="concept">
        <span className={styles.chipNo}>Concept 01</span>
        <span className={styles.chipName}>Brutalist Grid</span>
        <span className={styles.chipDesc}>{CONCEPT_DESC}</span>
      </aside>

      {/* ── HERO ── reuse the develop heat-field KV verbatim (unchanged) ── */}
      <Hero />

      {/* ── everything below the hero rides the ONE continuous warm Aura
            ground (Day1→Day2 drift). About / Audience / Lineup / Benefits / FAQ
            are our own transparent grid+rule structure on that field;
            SCHEDULE / VENUE / APPLY / FOOTER reuse the shared develop sections. */}
      <PostHeroRegion>
        {/* ── 00 ABOUT (행사 개요) ── intro + 2 day modules, ledger of facts.
              brutalist specimen-sheet voice; all copy verbatim. ── */}
        <section id="about" className={`${styles.section} shell`}>
          <SectionHead index="00" title="ABOUT" meta={SYS_LINE} />

          <p className={styles.aboutIntro}>{about.intro}</p>

          {/* two day-modules as a transparent modular grid on the aura */}
          <div className={styles.conceptGrid}>
            {about.days.map((d) => (
              <div key={d.day} className={styles.conceptCol}>
                <div className={styles.conceptDay}>
                  <span className={styles.conceptDayNo}>
                    MODULE {String(d.day).padStart(2, "0")} · DAY{" "}
                    {String(d.day).padStart(2, "0")} · {d.date}
                  </span>
                  <span className={styles.conceptEn}>
                    DAY {String(d.day).padStart(2, "0")}
                  </span>
                </div>
                <h3 className={styles.conceptTitle}>{d.title}</h3>
                <p className={styles.conceptBody}>{d.body}</p>
              </div>
            ))}
          </div>

          {/* fact ledger — pure data, monospaced, hairline-ruled */}
          <dl className={styles.ledger}>
            {LEDGER.map((rowItem) => (
              <div key={rowItem.k} className={styles.ledgerRow}>
                <dt className={styles.ledgerKey}>{rowItem.k}</dt>
                <dd className={styles.ledgerVal}>{rowItem.v}</dd>
              </div>
            ))}
          </dl>

          <p className={styles.aboutNote}>{conference.hero.note}</p>
        </section>

        {/* ── 01 AUDIENCE (추천 대상) ── numbered, tabular per-day lists ── */}
        <section id="audience" className={`${styles.section} shell`}>
          <SectionHead index="01" title="AUDIENCE" meta="추천 대상 · 2 TRACKS" />
          <div className={styles.audGrid}>
            {(
              [
                { day: 1, date: f1, data: audience.day1 },
                { day: 2, date: f2, data: audience.day2 },
              ] as const
            ).map(({ day, date, data }) => (
              <div key={day} className={styles.audCol}>
                <div className={styles.audColHead}>
                  <span className={styles.audColNo}>
                    DAY {String(day).padStart(2, "0")} · {date.md}({date.dow})
                  </span>
                  <h3 className={styles.audHeading}>{data.heading}</h3>
                </div>
                <ol className={styles.audList}>
                  {data.items.map((item, i) => (
                    <li key={i} className={styles.audItem}>
                      <span className={styles.audItemNo}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.audItemText}>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* ── 02 SPECIMENS (라인업) ── numbered tabular brutalist rows ── */}
        <section id="day1" className={`${styles.section} shell`}>
          <SectionHead
            index="02"
            title="SPECIMENS"
            meta={`${speakers.length} STUDIOS · 8 SESSIONS`}
          />

          <div className={styles.dayHeader}>
            <span className={styles.dayHeaderNo}>D1</span>
            <span className={styles.dayHeaderEn}>
              MODULE 01 · {about.days[0].title}
            </span>
            <span className={styles.dayHeaderDate}>
              {f1.md}({f1.dow})
            </span>
          </div>
          <div className={styles.rows}>
            {d1Speakers.map((s, i) => (
              <SpeakerRow
                key={s.id}
                s={s}
                n={`D1·${String(i + 1).padStart(2, "0")}`}
              />
            ))}
          </div>

          <div id="day2" className={styles.dayHeader}>
            <span className={styles.dayHeaderNo}>D2</span>
            <span className={styles.dayHeaderEn}>
              MODULE 02 · {about.days[1].title}
            </span>
            <span className={styles.dayHeaderDate}>
              {f2.md}({f2.dow})
            </span>
          </div>
          <div className={styles.rows}>
            {d2Speakers.map((s, i) => (
              <SpeakerRow
                key={s.id}
                s={s}
                n={`D2·${String(i + 1).padStart(2, "0")}`}
              />
            ))}
          </div>
        </section>

        {/* ── SCHEDULE ── shared develop section ── */}
        <Timetable />

        {/* ── 03 BENEFITS (혜택) ── brutalist grouped list ── */}
        <section id="benefits" className={`${styles.section} shell`}>
          <SectionHead
            index="03"
            title="BENEFITS"
            meta="연계 이벤트 · 참가 혜택"
          />
          <div className={styles.benGroups}>
            {benefits.groups.map((group, gi) => (
              <div key={gi} className={styles.benGroup}>
                <div className={styles.benGroupHead}>
                  <span className={styles.benGroupNo}>
                    G{String(gi + 1).padStart(2, "0")}
                  </span>
                  <h3 className={styles.benGroupHeading}>{group.heading}</h3>
                </div>
                <ul className={styles.benList}>
                  {group.items.map((item, ii) => (
                    <li key={ii} className={styles.benItem}>
                      <span className={styles.benItemNo}>
                        {String(gi + 1).padStart(2, "0")}.
                        {String(ii + 1).padStart(2, "0")}
                      </span>
                      <div className={styles.benItemBody}>
                        <h4 className={styles.benItemTitle}>{item.title}</h4>
                        <p className={styles.benItemDesc}>{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── VENUE ── shared develop section ── */}
        <Directions />

        {/* ── 04 FAQ ── brutalist Q/A, hairline-ruled numbered rows ── */}
        <section id="faq" className={`${styles.section} shell`}>
          <SectionHead index="04" title="FAQ" meta={`${faq.length} QUESTIONS`} />
          <ol className={styles.faqList}>
            {faq.map((item, i) => (
              <li key={i} className={styles.faqItem}>
                <span className={styles.faqNo}>
                  Q{String(i + 1).padStart(2, "0")}
                </span>
                <div className={styles.faqBody}>
                  <h3 className={styles.faqQ}>{item.q}</h3>
                  <p className={styles.faqA}>{item.a}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── APPLY / FOOTER ── shared develop sections ── */}
        <Apply />
        <Footer />
      </PostHeroRegion>
    </main>
  );
}
