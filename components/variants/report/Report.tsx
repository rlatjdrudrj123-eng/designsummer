"use client";

import { Archivo } from "next/font/google";
import { speakers, type Speaker } from "@/lib/content";
import { imageUrl } from "@/lib/images";
import { conference, type TimetableRow } from "@/lib/conference";
import AuroraField from "./AuroraField";
import styles from "./Report.module.css";

/* REPORT — an IRIDESCENT AURORA FESTIVAL POSTER.
   Faithful to the MAPP_MTL / "L'Inconnu" projection-mapping poster set: a soft
   full-bleed iridescent aurora gradient, a giant ghosted edition numeral, two
   HUGE thin grotesque words ("DESIGN" / "SUMMER") that melt into the gradient,
   a small top-right edition label, one minimal context line, and a bottom mark
   row of studio names. The whole one-page program continues in the same
   language: large light headings melting into per-section aurora fields, with
   tidy small structured metadata.

   CONTENT is the official unified Design Summer 2026 conference copy from
   @/lib/conference (facts verbatim). Timetable session rows are enriched with
   speaker photos + credentials via @/lib/content + @/lib/images. */

/* The scoped display face — a LIGHT-weight grotesque so the huge words read
   thin and luminous, exactly like the reference. */
const display = Archivo({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--report-display",
  display: "swap",
});

const { hero, about, audience, timetable, benefits, info, faq } = conference;

/* Look up the rich speaker record (photo key + credentials + studioEn) for a
   timetable row by matching its studio name. */
const speakerByStudio = new Map<string, Speaker>(
  speakers.map((s) => [s.studio, s])
);

function GhostNumeral({ children }: { children: string }) {
  return (
    <span className={`${display.className} ${styles.ghost}`} aria-hidden="true">
      {children}
    </span>
  );
}

function TimetableRowItem({ row }: { row: TimetableRow }) {
  const kind = row.kind ?? "session";

  if (kind !== "session") {
    return (
      <li className={`${styles.ttRow} ${styles.ttRowMeta}`} data-kind={kind}>
        <span className={`${display.className} ${styles.ttTime}`}>
          {row.time}
        </span>
        <span className={styles.ttMetaBody}>
          <span className={styles.ttMetaTag}>
            {kind === "reg" ? "REGISTRATION" : "BREAK"}
          </span>
          <span className={styles.ttMetaLabel}>{row.title}</span>
        </span>
      </li>
    );
  }

  const sp = row.studio ? speakerByStudio.get(row.studio) : undefined;
  const photo = sp ? imageUrl(sp.imageKey) : null;

  return (
    <li className={styles.ttRow}>
      <span className={`${display.className} ${styles.ttTime}`}>{row.time}</span>
      <div className={styles.ttSession}>
        <div className={styles.ttSessionHead}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.ttPhoto}
              src={photo}
              alt={`${row.speaker ?? row.studio} 프로필`}
              loading="lazy"
              width={56}
              height={56}
            />
          ) : (
            <span className={styles.ttPhotoPlaceholder} aria-hidden="true" />
          )}
          <div className={styles.ttSpeakerMeta}>
            <span className={styles.ttStudioLine}>
              <span className={styles.ttStudio}>{row.studio}</span>
              {sp && (
                <span className={`${display.className} ${styles.ttStudioEn}`}>
                  {sp.studioEn}
                </span>
              )}
            </span>
            {row.speaker && (
              <span className={styles.ttSpeaker}>{row.speaker}</span>
            )}
          </div>
        </div>
        <h4 className={styles.ttTitle}>{row.title}</h4>
        {row.desc && <p className={styles.ttDesc}>{row.desc}</p>}
        {sp && sp.credentials.length > 0 && (
          <ul className={styles.ttCreds}>
            {sp.credentials.map((c) => (
              <li key={c} className={styles.ttCred}>
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function TimetableColumn({
  label,
  data,
  scheme,
}: {
  label: string;
  data: typeof timetable.day1 | typeof timetable.day2;
  scheme: "spectral" | "ember";
}) {
  return (
    <div className={styles.ttCol} data-scheme={scheme}>
      <h3 className={styles.ttDayHead}>
        <span className={`${display.className} ${styles.ttDayLabel}`}>
          {label}
        </span>
        <span className={styles.ttDayMeta}>
          <span className={styles.ttDayDate}>{data.date}</span>
          <span className={styles.ttDayTheme}>{data.title}</span>
        </span>
      </h3>
      <ul className={styles.ttList}>
        {data.rows.map((row) => (
          <TimetableRowItem key={`${row.time}-${row.title}`} row={row} />
        ))}
      </ul>
    </div>
  );
}

export default function Report() {
  return (
    <div className={`${display.variable} ${styles.root}`}>
      {/* ============================ HERO POSTER ====================== */}
      <header className={styles.hero}>
        <div className={styles.fieldWrap} aria-hidden="true">
          <AuroraField scheme="spectral" />
        </div>

        {/* giant ghosted edition numeral behind the title */}
        <GhostNumeral>26</GhostNumeral>

        {/* top-right edition label */}
        <div className={`${display.className} ${styles.cornerLabel}`}>
          <span className={styles.cornerStrong}>K-PRINT 2026</span>
          <span className={styles.cornerThin}>{hero.badge}</span>
        </div>

        {/* the two huge thin words, melting into the gradient */}
        <h1 className={`${display.className} ${styles.title}`}>
          <span className={styles.titleTop}>DESIGN</span>
          <span className={styles.titleBottom}>SUMMER</span>
        </h1>

        {/* subtitle + minimal context — facts only */}
        <div className={styles.heroFoot}>
          <p className={styles.heroSubtitle}>{hero.subtitle}</p>
          <p className={styles.heroDesc}>{hero.desc}</p>
          <p className={styles.heroLine}>
            <span className={styles.heroDate}>{hero.date}</span>
            <span className={styles.heroVenue}>{hero.venue}</span>
          </p>

          {/* two distinct per-day registration CTAs */}
          <div className={styles.heroCtas}>
            {hero.register.map((r) => (
              <a
                key={r.day}
                className={`${display.className} ${styles.heroCta}`}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {r.label}
                <span aria-hidden="true">→</span>
              </a>
            ))}
          </div>
          <p className={styles.heroNote}>{hero.note}</p>

          {/* bottom partner-mark strip: the 8 studio names */}
          <div className={`${display.className} ${styles.markRow}`}>
            {speakers.map((s) => (
              <span key={s.id} className={styles.mark}>
                {s.studioEn}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ============================ ABOUT =========================== */}
      <section className={styles.intro}>
        <div className={styles.softField} aria-hidden="true">
          <AuroraField scheme="spectral" />
        </div>
        <div className={styles.introInner}>
          <p className={`${display.className} ${styles.eyebrow}`}>
            About · 행사 개요
          </p>
          <h2 className={`${display.className} ${styles.sectionLead}`}>
            {hero.title}
          </h2>
          <p className={styles.introBody}>{about.intro}</p>

          <div className={styles.concepts}>
            {about.days.map((d) => (
              <article key={d.day} className={styles.concept}>
                <p className={`${display.className} ${styles.conceptEn}`}>
                  DAY {d.day}
                  <span className={styles.conceptDay}>{d.date}</span>
                </p>
                <h3 className={styles.conceptTitle}>{d.title}</h3>
                <p className={styles.conceptBody}>{d.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ AUDIENCE ======================== */}
      <section className={styles.audience}>
        <div className={styles.softField} aria-hidden="true">
          <AuroraField scheme="ember" />
        </div>
        <div className={styles.audienceInner}>
          <header className={styles.sectionHead}>
            <h2 className={`${display.className} ${styles.sectionTitle}`}>
              Audience
            </h2>
            <span className={styles.sectionMeta}>추천 대상</span>
          </header>
          <div className={styles.audienceGrid}>
            {(
              [
                ["DAY 1", audience.day1],
                ["DAY 2", audience.day2],
              ] as const
            ).map(([label, a]) => (
              <article key={label} className={styles.audienceCard}>
                <p className={`${display.className} ${styles.audienceDay}`}>
                  {label}
                </p>
                <h3 className={styles.audienceHeading}>{a.heading}</h3>
                <ul className={styles.audienceList}>
                  {a.items.map((it) => (
                    <li key={it} className={styles.audienceItem}>
                      {it}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ TIMETABLE ======================= */}
      <section className={styles.timetable}>
        <div className={styles.softField} aria-hidden="true">
          <AuroraField scheme="spectral" />
        </div>
        <div className={styles.ttInner}>
          <header className={styles.sectionHead}>
            <h2 className={`${display.className} ${styles.sectionTitle}`}>
              Timetable
            </h2>
            <span className={styles.sectionMeta}>상세 프로그램</span>
          </header>
          <div className={styles.ttGrid}>
            <TimetableColumn
              label="DAY 1"
              data={timetable.day1}
              scheme="spectral"
            />
            <TimetableColumn label="DAY 2" data={timetable.day2} scheme="ember" />
          </div>
        </div>
      </section>

      {/* ============================ BENEFITS ======================== */}
      <section className={styles.benefits}>
        <div className={styles.softField} aria-hidden="true">
          <AuroraField scheme="ember" />
        </div>
        <div className={styles.benefitsInner}>
          <header className={styles.sectionHead}>
            <h2 className={`${display.className} ${styles.sectionTitle}`}>
              Benefits
            </h2>
            <span className={styles.sectionMeta}>연계 이벤트 · 참가 혜택</span>
          </header>
          <div className={styles.benefitsGrid}>
            {benefits.groups.map((g) => (
              <div key={g.heading} className={styles.benefitGroup}>
                <h3 className={`${display.className} ${styles.benefitGroupHead}`}>
                  {g.heading}
                </h3>
                <div className={styles.benefitItems}>
                  {g.items.map((it) => (
                    <article key={it.title} className={styles.benefitItem}>
                      <h4 className={styles.benefitTitle}>{it.title}</h4>
                      <p className={styles.benefitBody}>{it.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ INFORMATION ===================== */}
      <section className={styles.info}>
        <div className={styles.softField} aria-hidden="true">
          <AuroraField scheme="ember" />
        </div>
        <div className={styles.infoInner}>
          <header className={styles.sectionHead}>
            <h2 className={`${display.className} ${styles.sectionTitle}`}>
              Information
            </h2>
            <span className={styles.sectionMeta}>안내 · 오시는 길</span>
          </header>
          <dl className={styles.infoTable}>
            {(
              [
                ["주최 · Host", info.host],
                ["참가비 · Fee", info.price],
                ["정원 · Seats", info.capacity],
                ["장소 · Venue", info.address],
                ["주차 · Parking", info.parking],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className={styles.infoRow}>
                <dt className={`${display.className} ${styles.infoKey}`}>{k}</dt>
                <dd className={styles.infoVal}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ============================ FAQ ============================= */}
      <section className={styles.faq}>
        <div className={styles.softField} aria-hidden="true">
          <AuroraField scheme="spectral" />
        </div>
        <div className={styles.faqInner}>
          <header className={styles.sectionHead}>
            <h2 className={`${display.className} ${styles.sectionTitle}`}>FAQ</h2>
            <span className={styles.sectionMeta}>자주 묻는 질문</span>
          </header>
          <dl className={styles.faqList}>
            {faq.map((f) => (
              <div key={f.q} className={styles.faqRow}>
                <dt className={styles.faqQ}>
                  <span className={`${display.className} ${styles.faqMark}`}>
                    Q
                  </span>
                  {f.q}
                </dt>
                <dd className={styles.faqA}>{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ============================ APPLY CTA ======================= */}
      <section className={styles.apply}>
        <div className={styles.fieldWrap} aria-hidden="true">
          <AuroraField scheme="spectral" />
        </div>
        <div className={styles.applyInner}>
          <p className={`${display.className} ${styles.applyEyebrow}`}>
            Registration
          </p>
          <h2 className={`${display.className} ${styles.applyTitle}`}>
            <span className={styles.applyTitleTop}>JOIN THE</span>
            <span className={styles.applyTitleBottom}>SUMMER</span>
          </h2>
          <p className={styles.applySub}>
            {hero.date} · {hero.venue}
          </p>
          <div className={styles.applyCtas}>
            {hero.register.map((r) => (
              <a
                key={r.day}
                className={`${display.className} ${styles.applyBtn}`}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {r.label} <span aria-hidden="true">→</span>
              </a>
            ))}
          </div>
          <span className={styles.applyNote}>
            일자별 개별 등록입니다. 양일 참석 시 두 폼 모두 등록해 주세요.
          </span>
        </div>
      </section>

      {/* ============================ FOOTER ========================== */}
      <footer className={styles.footer}>
        <span className={`${display.className} ${styles.footWordmark}`}>
          Design Summer 2026
        </span>
        <span className={styles.footMeta}>
          {hero.subtitle} · {hero.venue}
        </span>
        <span className={styles.footContact}>{info.host}</span>
      </footer>
    </div>
  );
}
