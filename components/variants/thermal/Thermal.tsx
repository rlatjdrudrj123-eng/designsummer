"use client";

import { Archivo } from "next/font/google";
import { useState } from "react";
import { speakers, type Speaker } from "@/lib/content";
import { imageUrl } from "@/lib/images";
import { conference, type TimetableRow } from "@/lib/conference";
import ThermalField from "./ThermalField";
import styles from "./Thermal.module.css";

/**
 * THERMAL display face — Archivo, a clean, confident grotesque. The reference
 * is a photographic thermal image, so the type stays simple and legible over it
 * rather than techy/HUD. It is the single scoped next/font for this variant and
 * is distinct from every other variant's face (Instrument Sans, Saira
 * Condensed, Fraunces, Space Mono, Fontdiner Swanky, Unbounded). Bound to
 * --font-display on the root so every Latin/label slot (kickers, EN labels,
 * CTAs) picks it up. Korean copy stays on --font-kr (Pretendard).
 */
const display = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

/* THERMAL — full one-page promo variant for the official Design Summer 2026
   conference. A single full-bleed thermal-camera/heatmap field (Canvas2D, soft
   spectrum blobs + heavy sensor grain) is fixed behind the entire page, so the
   thermal image carries through every section. Content sits over it in clean
   white type inside grain-tinted dark panels / scrims for legibility. All copy
   comes from @/lib/conference (the authoritative source). Self-contained;
   theme scoped on the wrapper root. */

/* studio (Korean) → speaker record, so timetable session rows can be enriched
   with the official profile photo + credentials from speakers.json. */
const speakerByStudio = new Map<string, Speaker>(
  speakers.map((s) => [s.studio, s]),
);

/* image with graceful 404 fallback (project convention: plain <img>) */
function Img({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/* a single program session, enriched with the speaker's photo + credentials */
function SessionRow({ row, index }: { row: TimetableRow; index: number }) {
  const speaker = row.studio ? speakerByStudio.get(row.studio) : undefined;
  const profile = speaker ? imageUrl(`speaker-${speaker.id}`) : null;
  const num = String(index).padStart(2, "0");

  return (
    <article className={styles.session}>
      <div className={styles.sessionMedia}>
        <span className={styles.sessionTag}>
          {speaker?.studioEn ?? row.studio}
        </span>
        {profile && speaker && (
          <Img
            src={profile}
            alt={`${row.studio} ${speaker.name}`}
            className={styles.sessionImg}
          />
        )}
        <span className={styles.sessionIndex}>{num}</span>
      </div>

      <div className={styles.sessionBody}>
        <div className={styles.sessionHead}>
          <span className={styles.sessionTime}>{row.time}</span>
          <h4 className={styles.sessionStudio}>
            {row.studio}
            {speaker && (
              <span className={styles.sessionStudioEn}>{speaker.studioEn}</span>
            )}
          </h4>
        </div>

        <p className={styles.sessionTitle}>{row.title}</p>

        {(row.speaker || speaker) && (
          <p className={styles.sessionWho}>
            <span className={styles.sessionName}>{row.speaker}</span>
            {speaker && (
              <span className={styles.sessionRole}>{speaker.role}</span>
            )}
          </p>
        )}

        {row.desc && <p className={styles.sessionDesc}>{row.desc}</p>}

        {speaker && speaker.credentials.length > 0 && (
          <ul className={styles.sessionCreds}>
            {speaker.credentials.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

/* registration / break markers — visually distinct from sessions */
function MarkerRow({ row }: { row: TimetableRow }) {
  const isReg = row.kind === "reg";
  return (
    <div
      className={`${styles.marker} ${isReg ? styles.markerReg : styles.markerBreak}`}
    >
      <span className={styles.markerTime}>{row.time}</span>
      <span className={styles.markerKind}>{isReg ? "REGISTRATION" : "BREAK"}</span>
      <span className={styles.markerLabel}>{row.title}</span>
    </div>
  );
}

function DayProgram({
  day,
  label,
}: {
  day: { title: string; date: string; rows: TimetableRow[] };
  label: string;
}) {
  // running session counter so only sessions are numbered
  let n = 0;
  return (
    <div className={styles.dayGroup}>
      <h3 className={styles.dayHead}>
        <span className={styles.dayHeadDay}>{label}</span>
        <span className={styles.dayHeadConcept}>{day.title}</span>
        <span className={styles.dayHeadDate}>{day.date}</span>
      </h3>
      <div className={styles.program}>
        {day.rows.map((row, i) => {
          if (row.kind === "reg" || row.kind === "break") {
            return <MarkerRow key={i} row={row} />;
          }
          n += 1;
          return <SessionRow key={i} row={row} index={n} />;
        })}
      </div>
    </div>
  );
}

export default function Thermal() {
  const { hero, about, audience, timetable, benefits, info, faq } = conference;

  return (
    <div className={`${styles.root} ${display.variable}`}>
      {/* full-bleed thermal field behind the entire page */}
      <div className={styles.fieldLayer} aria-hidden="true">
        <ThermalField />
        <div className={styles.fieldTint} />
      </div>

      {/* ---- HERO ------------------------------------------------ */}
      <header className={styles.hero}>
        <div className={styles.heroScrim} aria-hidden="true" />

        <div className={styles.heroInner}>
          <p className={styles.heroKicker}>
            <span className={styles.heroKickerDot} aria-hidden="true" />
            <span>{hero.badge}</span>
          </p>

          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleMain}>
              <span className={styles.heroTitleWord}>디자인 썸머</span>
              <span className={styles.heroTitleWord}>일산</span>
            </span>
            <span className={styles.heroTitleEn}>{hero.title}</span>
          </h1>

          <p className={styles.heroSub}>{hero.subtitle}</p>
          <p className={styles.heroDesc}>{hero.desc}</p>

          <div className={styles.heroMeta}>
            <span className={styles.heroMetaItem}>{hero.date}</span>
            <span className={styles.heroMetaItem}>{hero.venue}</span>
          </div>

          <p className={styles.heroNote}>{hero.note}</p>

          <div className={styles.heroCtas}>
            {hero.register.map((r) => (
              <a
                key={r.day}
                className={`${styles.heroCta} ${r.day === 1 ? styles.heroCtaD1 : styles.heroCtaD2}`}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {r.label}
                <span className={styles.heroCtaArrow} aria-hidden="true">
                  →
                </span>
              </a>
            ))}
          </div>
        </div>

        <span className={styles.heroScroll} aria-hidden="true">
          SCROLL
        </span>
      </header>

      {/* ---- ABOUT / 행사 개요 ----------------------------------- */}
      <section className={styles.about}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>행사 개요</h2>
          <span className={styles.sectionMeta}>About the Conference</span>
        </div>

        <p className={styles.aboutIntro}>{about.intro}</p>

        <div className={styles.days}>
          {about.days.map((d) => (
            <article
              key={d.day}
              className={`${styles.dayCard} ${d.day === 1 ? styles.dayCardD1 : styles.dayCardD2}`}
            >
              <span className={styles.dayCardEn}>DAY {d.day}</span>
              <span className={styles.dayCardDate}>{d.date}</span>
              <h3 className={styles.dayCardTitle}>{d.title}</h3>
              <p className={styles.dayCardBody}>{d.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---- 추천 대상 ------------------------------------------- */}
      <section className={styles.audience}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>추천 대상</h2>
          <span className={styles.sectionMeta}>Who Should Attend</span>
        </div>

        <div className={styles.audGrid}>
          {(
            [
              [1, audience.day1],
              [2, audience.day2],
            ] as const
          ).map(([d, group]) => (
            <article
              key={d}
              className={`${styles.audCard} ${d === 1 ? styles.audCardD1 : styles.audCardD2}`}
            >
              <span className={styles.audDay}>DAY {d}</span>
              <h3 className={styles.audHeading}>{group.heading}</h3>
              <ul className={styles.audItems}>
                {group.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ---- 상세 타임테이블 ------------------------------------- */}
      <section className={styles.timetable}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>상세 프로그램</h2>
          <span className={styles.sectionMeta}>Full Timetable</span>
        </div>

        <DayProgram day={timetable.day1} label="DAY 1" />
        <DayProgram day={timetable.day2} label="DAY 2" />
      </section>

      {/* ---- 참가 혜택 ------------------------------------------- */}
      <section className={styles.benefits}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>참가 혜택</h2>
          <span className={styles.sectionMeta}>Events &amp; Benefits</span>
        </div>

        <div className={styles.benefitGroups}>
          {benefits.groups.map((g, gi) => (
            <div key={gi} className={styles.benefitGroup}>
              <h3 className={styles.benefitHeading}>{g.heading}</h3>
              <div className={styles.benefitItems}>
                {g.items.map((it, i) => (
                  <article key={i} className={styles.benefitItem}>
                    <h4 className={styles.benefitTitle}>{it.title}</h4>
                    <p className={styles.benefitBody}>{it.body}</p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- 안내 · 오시는 길 ------------------------------------ */}
      <section className={styles.info}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>안내 · 오시는 길</h2>
          <span className={styles.sectionMeta}>{info.host}</span>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>HOST</span>
            <span className={styles.infoValue}>{info.host}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>PRICE</span>
            <span className={styles.infoValue}>{info.price}</span>
            <span className={styles.infoSub}>일자별 개별 등록</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>CAPACITY</span>
            <span className={styles.infoValue}>{info.capacity}</span>
          </div>
          <div className={`${styles.infoItem} ${styles.infoWide}`}>
            <span className={styles.infoLabel}>ADDRESS</span>
            <span className={styles.infoValue}>{info.address}</span>
          </div>
          <div className={`${styles.infoItem} ${styles.infoWide}`}>
            <span className={styles.infoLabel}>PARKING</span>
            <span className={styles.infoValueSm}>{info.parking}</span>
          </div>
        </div>
      </section>

      {/* ---- FAQ ------------------------------------------------- */}
      <section className={styles.faq}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>자주 묻는 질문</h2>
          <span className={styles.sectionMeta}>FAQ</span>
        </div>

        <ul className={styles.faqList}>
          {faq.map((f, i) => (
            <li key={i} className={styles.faqItem}>
              <p className={styles.faqQ}>
                <span className={styles.faqQMark} aria-hidden="true">
                  Q
                </span>
                {f.q}
              </p>
              <p className={styles.faqA}>{f.a}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- APPLY CTA ------------------------------------------- */}
      <section className={styles.apply}>
        <div className={styles.applyScrim} aria-hidden="true" />
        <div className={styles.applyInner}>
          <p className={styles.applyKicker}>{hero.subtitle}</p>
          <h2 className={styles.applyTitle}>{hero.title}</h2>
          <p className={styles.applyKo}>일자별 사전등록으로 참여하세요</p>
          <div className={styles.applyCtas}>
            {hero.register.map((r) => (
              <a
                key={r.day}
                className={`${styles.applyBtn} ${r.day === 1 ? styles.applyBtnD1 : styles.applyBtnD2}`}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {r.label} →
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FOOTER ---------------------------------------------- */}
      <footer className={styles.footer}>
        <div className={styles.footerBar} aria-hidden="true" />
        <div className={styles.footerInner}>
          <span className={styles.footerTitle}>{hero.title}</span>
          <div className={styles.footerMeta}>
            <span>{info.host}</span>
            <span>{hero.venue}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
