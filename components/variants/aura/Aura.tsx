"use client";

import { Unbounded } from "next/font/google";
import { useEffect, useRef, useState, type RefObject } from "react";
import { conference, type TimetableRow } from "@/lib/conference";
import { speakers, type Speaker } from "@/lib/content";
import { imageUrl, workImages } from "@/lib/images";
import styles from "./Aura.module.css";
import AuraField from "./AuraField";

/**
 * Scoped Latin display face for this variant. AURA's voice is a dreamy,
 * contemporary light/aura festival — so we give it Unbounded: a soft,
 * rounded-geometric festival display that reads luminous at large sizes and
 * sets AURA's type voice apart from the other (Instrument-Sans) variants.
 * This is the single allowed scoped next/font face; Korean copy stays on
 * --font-kr (Pretendard).
 */
const display = Unbounded({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--aura-display",
  display: "swap",
});

/**
 * AURA concept copy — short connective design copy that frames the real
 * Design Summer 2026 conference as a luminous "summer of design" festival.
 * No invented facts: just a festival-toned EN display line ("Summer / of
 * Design") that half-melts into the aura, with the official seminar name +
 * subtitle sitting crisply beneath. The melt-in line is decorative; the real
 * title is the legible anchor. All hard facts come from `conference`.
 */
const auraConcept = {
  /** small hero tagline next to the wordmark (rendered lowercase in CSS) */
  tagline: "a summer of design",
  /** small EN kicker above the melt-in title */
  titleKicker: "Design Summer 2026",
  /** Melt-in display title, two balanced lines. Decorative festival line that
      sits near the ground hue so it luminously melts into the aura while the
      real title ("디자인 썸머 일산") stays crisp beneath it. */
  display: ["Summer", "of Design"],
  /** crisp, legible real seminar name shown under the melt-in title */
  realTitle: "디자인 썸머 일산",
  /** apply CTA lockup */
  apply: ["Step into", "the glow"],
};

/* ─── studio → speaker.id, so timetable rows can pull photos/credentials ─── */
const studioToId: Record<string, string> = {};
for (const s of speakers) studioToId[s.studio] = s.id;
function speakerByStudio(studio?: string | null): Speaker | undefined {
  if (!studio) return undefined;
  return speakers.find((s) => s.id === studioToId[studio]);
}

const { hero, about, audience, timetable, benefits, info, faq } = conference;

/* ---------------------------------------------------------------- */

/**
 * CreditRow — the bottom row of small, crisp credit labels, styled after the
 * reference poster's "Présenté par:" / "Propulsé par:" + mark row. These crisp
 * labels are the legibility anchor against the giant tonal type. Facts only
 * (host / venue / dates), no invented partners.
 */
function CreditRow() {
  return (
    <div className={styles.creditRow}>
      <div className={styles.credit}>
        <span className={styles.creditK}>주최 · Présenté par</span>
        <span className={styles.creditV}>{info.host}</span>
      </div>
      <div className={styles.credit}>
        <span className={styles.creditK}>장소 · Venue</span>
        <span className={styles.creditV}>{hero.venue}</span>
      </div>
      <div className={styles.credit}>
        <span className={styles.creditK}>일시 · Dates</span>
        <span className={styles.creditV}>{hero.date}</span>
      </div>
      {/* small partner mark row — the K·print wordmark stands in for the
          poster's logo strip; kept crisp/monochrome like the reference. */}
      <div className={styles.marks} aria-hidden="true">
        <span className={styles.mark}>
          K<em>·</em>print
        </span>
        <span className={styles.markDot} />
        <span className={styles.markLabel}>KINTEX</span>
      </div>
    </div>
  );
}

/**
 * SessionCard — a frosted speaker card enriched with the portrait + credentials
 * from speakers.json (matched by studio). All session copy comes from the
 * authoritative `conference` timetable row.
 */
function SessionCard({ row }: { row: TimetableRow }) {
  const s = speakerByStudio(row.studio);
  const portrait = s ? imageUrl(`speaker-${s.id}`) : null;
  const works = s ? workImages(s.id) : [];
  const creds = s?.credentials ?? [];
  const studioEn = s?.studioEn ?? "";

  return (
    <article className={styles.card}>
      <header className={styles.cardHead}>
        {portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.portrait}
            src={portrait}
            alt={`${row.studio} ${s?.name ?? ""}`}
            loading="lazy"
          />
        ) : (
          <div className={styles.portraitPh} aria-hidden="true">
            {(studioEn || row.studio || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div className={styles.cardId}>
          <div className={styles.studioTonal}>{row.studio}</div>
          {studioEn && <div className={styles.studioEn}>{studioEn}</div>}
        </div>
        <div className={styles.cardTime}>{row.time}</div>
      </header>

      <div className={styles.cardBody}>
        <h3 className={styles.session}>{row.title}</h3>
        {row.desc && <p className={styles.sessionDesc}>{row.desc}</p>}
        {row.speaker && (
          <p className={styles.person}>
            <b>{row.speaker}</b>
            {s?.role && <span>{s.role}</span>}
          </p>
        )}
        {creds.length > 0 && (
          <ul className={styles.creds}>
            {creds.slice(0, 3).map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
      </div>

      {works.length > 0 && (
        <div
          className={styles.works}
          role="group"
          aria-label={`${row.studio} 대표작`}
        >
          {works.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              className={styles.work}
              src={src}
              alt={`${row.studio} 대표작 ${i + 1}`}
              loading="lazy"
            />
          ))}
        </div>
      )}
    </article>
  );
}

/** A full day block: header + reg/break dividers + enriched session cards. */
function DayBlock({
  day,
}: {
  day: typeof timetable.day1 | typeof timetable.day2;
}) {
  return (
    <div className={styles.dayBlock}>
      <div className={styles.lineupHead}>
        <span className={styles.kicker}>DAY {day.day}</span>
        <h3 className={styles.dayTitle}>
          <span className={styles.tonalInline}>{day.title}</span>
          <span className={styles.dayMeta}>{day.date}</span>
        </h3>
      </div>
      <div className={styles.dayRows}>
        {day.rows.map((row, i) =>
          row.kind === "reg" || row.kind === "break" ? (
            <div
              key={i}
              className={`${styles.marker} ${
                row.kind === "break" ? styles.markerBreak : styles.markerReg
              }`}
            >
              <span className={styles.markerTime}>{row.time}</span>
              <span className={styles.markerLabel}>{row.title}</span>
            </div>
          ) : (
            <SessionCard key={i} row={row} />
          ),
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

/**
 * useAuraHue — drives the background aura hue (0 = DAY 1 mood, 1 = DAY 2 mood)
 * from which section is currently dominant in the viewport. We tag DAY-2-leaning
 * sections with data-mood="2"; an IntersectionObserver picks the most-visible
 * tagged element and we set the hue accordingly. The AuraField eases toward it,
 * so crossing into the DAY 2 region drifts the whole aura from green → magenta.
 */
function useAuraHue(rootRef: RefObject<HTMLDivElement | null>) {
  const [hue, setHue] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = Array.from(
      root.querySelectorAll<HTMLElement>("[data-mood]"),
    );
    if (targets.length === 0) return;

    const ratios = new Map<HTMLElement, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          ratios.set(e.target as HTMLElement, e.intersectionRatio);
        }
        let best: HTMLElement | null = null;
        let bestR = 0;
        for (const [el, r] of ratios) {
          if (r > bestR) {
            bestR = r;
            best = el;
          }
        }
        if (best && bestR > 0.08) {
          setHue(best.dataset.mood === "2" ? 1 : 0);
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [rootRef]);

  return hue;
}

/* ---------------------------------------------------------------- */

export default function Aura() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hue = useAuraHue(rootRef);

  // mirror the live hue onto a CSS var so DOM accents (tonal type stops, card
  // tints) shift mood in step with the canvas. We ease in CSS via transition.
  useEffect(() => {
    const root = rootRef.current;
    if (root) root.style.setProperty("--mood", String(hue));
  }, [hue]);

  return (
    <div ref={rootRef} className={`${styles.wrap} ${display.variable}`}>
      {/* persistent aura ground behind everything */}
      <div className={styles.auraLayer} aria-hidden="true">
        <AuraField hue={hue} className={styles.auraCanvas} />
        <div className={styles.veil} />
      </div>

      {/* ===================== HERO ===================== */}
      <header className={styles.hero} data-mood="1">
        {/* soft translucent numeral floating in the blur — the reference
            poster's giant soft glass numeral, here the real edition year set
            very faint so it reads as a tonal accent, not copy. */}
        <div className={styles.floatShape} aria-hidden="true">
          <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="auraShapeG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <circle
              cx="300"
              cy="300"
              r="250"
              fill="none"
              stroke="url(#auraShapeG)"
              strokeWidth="2"
            />
            <circle cx="300" cy="300" r="250" fill="url(#auraShapeG)" />
          </svg>
          <span className={styles.floatGlyph}>2026</span>
        </div>

        {/* TOP BAR: wordmark + tagline left; crisp badge top-right. */}
        <div className={styles.heroTop}>
          <div className={styles.heroBrand}>
            <span className={styles.wordmark}>
              K<em>·</em>print
            </span>
            <span className={styles.tagline}>{auraConcept.tagline}</span>
          </div>
          <div className={styles.editionLabel}>
            <span className={styles.editionK}>DESIGN SUMMER</span>
            <span className={styles.editionV}>{hero.badge}</span>
          </div>
        </div>

        {/* MID: melt-in display title + real title + subtitle. A festival
            blurb (real desc/note) floats opposite for legibility contrast. */}
        <div className={styles.heroMid}>
          <div className={styles.titleBlock}>
            <h1
              className={styles.heroTitle}
              aria-label={`${auraConcept.realTitle} — ${hero.title}`}
            >
              <span className={styles.titleEn} aria-hidden="true">
                {auraConcept.titleKicker}
              </span>
              <span className={styles.titleLines} aria-hidden="true">
                <span className={styles.tonalLine}>
                  {auraConcept.display[0]}
                </span>
                <span className={`${styles.tonalLine} ${styles.tonalLineB}`}>
                  {auraConcept.display[1]}
                </span>
              </span>
            </h1>
            {/* real seminar name — crisp + legible, the actual title */}
            <p className={styles.realTitle}>{auraConcept.realTitle}</p>
            <p className={styles.heroKr}>{hero.subtitle}</p>
          </div>

          {/* crisp festival blurb block — small, high-legibility. Real facts. */}
          <div className={styles.blurb}>
            <p className={styles.blurbKr}>{hero.desc}</p>
            <p className={styles.blurbEn}>{hero.note}</p>
          </div>
        </div>

        {/* per-day registration — two distinct CTAs */}
        <div className={styles.heroRegister}>
          {hero.register.map((r) => (
            <a
              key={r.day}
              className={`${styles.regBtn} ${
                r.day === 2 ? styles.regBtnD2 : styles.regBtnD1
              }`}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {r.label} <span aria-hidden="true">→</span>
            </a>
          ))}
        </div>

        {/* BOTTOM: crisp credit labels + small partner marks. */}
        <CreditRow />
      </header>

      {/* ===================== ABOUT (행사 개요) ===================== */}
      <section
        className={styles.section}
        data-mood="1"
        aria-labelledby="aura-about"
      >
        <div className={styles.inner}>
          <span className={styles.kicker}>ABOUT</span>
          <h2 id="aura-about" className={styles.introLead}>
            {hero.subtitle}
          </h2>
          <p className={styles.introBody}>{about.intro}</p>

          <div className={styles.conceptRow}>
            {about.days.map((d) => (
              <article
                key={d.day}
                className={styles.concept}
                data-d={String(d.day)}
              >
                <div className={styles.conceptEn}>
                  DAY {d.day} · {d.date}
                </div>
                <h3 className={styles.conceptTitle}>{d.title}</h3>
                <p className={styles.conceptBody}>{d.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 추천 대상 (AUDIENCE) ===================== */}
      <section
        className={styles.section}
        data-mood="1"
        aria-labelledby="aura-aud"
      >
        <div className={styles.inner}>
          <span className={styles.kicker}>WHO IT&apos;S FOR</span>
          <h2 id="aura-aud" className={styles.sectionTitle}>
            <span className={styles.tonalInline}>추천 대상</span>
          </h2>
          <div className={styles.audGrid}>
            <article className={styles.audCard} data-d="1">
              <div className={styles.audDay}>DAY 1</div>
              <h3 className={styles.audHeading}>{audience.day1.heading}</h3>
              <ul className={styles.audList}>
                {audience.day1.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </article>
            <article className={styles.audCard} data-d="2">
              <div className={styles.audDay}>DAY 2</div>
              <h3 className={styles.audHeading}>{audience.day2.heading}</h3>
              <ul className={styles.audList}>
                {audience.day2.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ===================== TIMETABLE · DAY 1 ===================== */}
      <section
        className={styles.section}
        data-mood="1"
        aria-labelledby="aura-tt1"
      >
        <div className={styles.inner}>
          <span className={styles.kicker}>PROGRAM</span>
          <h2 id="aura-tt1" className={styles.sectionTitle}>
            <span className={styles.tonalInline}>Timetable</span>
          </h2>
          <DayBlock day={timetable.day1} />
        </div>
      </section>

      {/* ===================== TIMETABLE · DAY 2 ===================== */}
      <section
        className={styles.section}
        data-mood="2"
        aria-labelledby="aura-tt2"
      >
        <div className={styles.inner}>
          <DayBlock day={timetable.day2} />
        </div>
      </section>

      {/* ===================== 참가 혜택 (BENEFITS) ===================== */}
      <section
        className={styles.section}
        data-mood="2"
        aria-labelledby="aura-ben"
      >
        <div className={styles.inner}>
          <span className={styles.kicker}>BENEFITS</span>
          <h2 id="aura-ben" className={styles.sectionTitle}>
            <span className={styles.tonalInline}>참가 혜택</span>
          </h2>
          <div className={styles.benGrid}>
            {benefits.groups.map((g, gi) => (
              <div key={gi} className={styles.benGroup}>
                <h3 className={styles.benHeading}>{g.heading}</h3>
                <ul className={styles.benList}>
                  {g.items.map((it, i) => (
                    <li key={i} className={styles.benItem}>
                      <b>{it.title}</b>
                      <p>{it.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 안내 · 오시는 길 (INFO) ===================== */}
      <section
        className={styles.section}
        data-mood="2"
        aria-labelledby="aura-info"
      >
        <div className={styles.inner}>
          <span className={styles.kicker}>WHERE &amp; WHEN</span>
          <div className={styles.venueGrid}>
            <div className={styles.venueBig} id="aura-info">
              <span className={styles.venueYr}>{hero.date}</span>
              <span className={styles.tonalInline}>08.20 – 21</span>
            </div>
            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>Host</dt>
                <dd>{info.host}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Capacity</dt>
                <dd>{info.capacity}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Price</dt>
                <dd>{info.price}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Address</dt>
                <dd>{info.address}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Parking</dt>
                <dd>{info.parking}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ===================== APPLY CTA ===================== */}
      <section
        className={`${styles.section} ${styles.applySection}`}
        data-mood="2"
        aria-labelledby="aura-apply"
      >
        <div className={`${styles.inner} ${styles.applyInner}`}>
          <span className={styles.kicker}>JOIN</span>
          <h2 id="aura-apply" className={styles.applyTitle}>
            <span className={styles.tonalLine}>{auraConcept.apply[0]}</span>
            <span className={`${styles.tonalLine} ${styles.tonalLineB}`}>
              {auraConcept.apply[1]}
            </span>
          </h2>
          <p className={styles.applySub}>{hero.note}</p>
          <div className={styles.applyBtns}>
            {hero.register.map((r) => (
              <a
                key={r.day}
                className={`${styles.regBtn} ${
                  r.day === 2 ? styles.regBtnD2 : styles.regBtnD1
                }`}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {r.label} <span aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section
        className={styles.section}
        data-mood="2"
        aria-labelledby="aura-faq"
      >
        <div className={styles.inner}>
          <span className={styles.kicker}>FAQ</span>
          <h2 id="aura-faq" className={styles.sectionTitle}>
            <span className={styles.tonalInline}>자주 묻는 질문</span>
          </h2>
          <div className={styles.faqList}>
            {faq.map((f, i) => (
              <details key={i} className={styles.faqItem}>
                <summary className={styles.faqQ}>
                  <span>{f.q}</span>
                  <span className={styles.faqMark} aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className={styles.faqA}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className={styles.footer} data-mood="2">
        <div className={styles.footerInner}>
          <div className={styles.footerMark}>{auraConcept.realTitle}</div>
          <div className={styles.footerMeta}>
            <div>{info.host}</div>
            <div>{hero.venue}</div>
            <div>{hero.date}</div>
          </div>
          <div className={styles.footerNote}>
            {hero.title} · Two Days · Summer of Design
          </div>
        </div>
      </footer>
    </div>
  );
}
