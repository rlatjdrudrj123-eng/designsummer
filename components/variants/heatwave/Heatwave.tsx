"use client";

import { useState } from "react";
import { conference, type TimetableRow } from "@/lib/conference";
import { speakers, type Speaker } from "@/lib/content";
import { imageUrl } from "@/lib/images";
import Hero from "./Hero";
import styles from "./Heatwave.module.css";

/* HEATWAVE — full one-page promo variant, rendering the official Design Summer
   2026 conference content from @/lib/conference. Identity preserved: white
   ground, heavy black type, the blue→magenta→red KV gradient throughline, the
   S-Core Dream / Unbounded faces (hero), and the Day1-left / Day2-right split.
   The day split maps to Day 1 = 디자인의 새로운 관점 (cool) / Day 2 = 디자인
   실무의 확장 (warm). Self-contained; theme scoped on the wrapper. */

/* Map a timetable row's studio name → its full Speaker record so session rows
   can be enriched with the profile photo + credentials from @/lib/content. */
const speakerByStudio: Record<string, Speaker> = Object.fromEntries(
  speakers.map((s) => [s.studio, s]),
);

/* image with graceful 404 fallback (project convention: plain <img>) */
function Img({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

/* One detailed program row. reg/break rows read as a quiet rule; session rows
   carry time · studio · speaker · title · desc, plus (when available) the
   speaker portrait and a couple of credentials pulled in by studio name. */
function ProgramRow({ row }: { row: TimetableRow }) {
  const kind = row.kind ?? "session";

  if (kind !== "session") {
    return (
      <li className={`${styles.progRow} ${styles.progMeta}`} data-kind={kind}>
        <span className={styles.progTime}>{row.time}</span>
        <span className={styles.progMetaLabel}>{row.title}</span>
      </li>
    );
  }

  const sp = row.studio ? speakerByStudio[row.studio] : undefined;
  const profile = sp ? imageUrl(`speaker-${sp.id}`) : null;
  const creds = sp?.credentials.slice(0, 2) ?? [];

  return (
    <li className={`${styles.progRow} ${styles.progSession}`} id={sp ? `sp-${sp.id}` : undefined}>
      <span className={styles.progTime}>
        <span className={styles.heatDot} aria-hidden="true" />
        {row.time}
      </span>

      <div className={styles.progMain}>
        <div className={styles.progHead}>
          <span className={styles.progStudio}>
            {row.studio}
            {sp && <span className={styles.progStudioEn}>{sp.studioEn}</span>}
          </span>
          {row.speaker && <span className={styles.progSpeaker}>{row.speaker}</span>}
        </div>
        <h4 className={styles.progTitle}>{row.title}</h4>
        {row.desc && <p className={styles.progDesc}>{row.desc}</p>}
        {creds.length > 0 && (
          <ul className={styles.progCreds}>
            {creds.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.progMedia}>
        <div className={`${styles.progProfile} ${styles.progProfilePh}`}>
          <span>{sp?.studioEn ?? row.studio}</span>
          {profile && (
            <Img
              src={profile}
              alt={`${row.studio} ${sp?.name ?? ""}`}
              className={styles.progProfileImg}
            />
          )}
        </div>
      </div>
    </li>
  );
}

export default function Heatwave() {
  const { hero, about, audience, timetable, benefits, info, faq } = conference;

  const days = [
    { ...timetable.day1, audience: audience.day1, dayClass: styles.dayCool, label: "DAY 1" },
    { ...timetable.day2, audience: audience.day2, dayClass: styles.dayWarm, label: "DAY 2" },
  ] as const;

  return (
    <div className={styles.root}>
      <Hero />

      {/* ---- ABOUT (행사 개요) ----------------------------------- */}
      <section className={styles.intro}>
        <p className={styles.kicker}>
          <span className={styles.kickerBar} aria-hidden="true" />
          ABOUT · {hero.subtitle}
        </p>
        <h2 className={styles.introLead}>{hero.desc}</h2>
        <p className={styles.introBody}>{about.intro}</p>

        <div className={styles.concepts}>
          {about.days.map((d, i) => (
            <div
              key={d.day}
              className={`${styles.concept} ${i === 0 ? styles.dayCool : styles.dayWarm}`}
            >
              <span className={styles.conceptDay}>
                DAY {d.day} · {d.date}
              </span>
              <h3 className={styles.conceptTitle}>{d.title}</h3>
              <p className={styles.conceptBody}>{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- TARGET AUDIENCE (추천 대상) — Day1-left / Day2-right - */}
      <section className={styles.audience}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>추천 대상</h2>
          <span className={styles.sectionMeta}>WHO SHOULD ATTEND</span>
        </div>

        <div className={styles.split}>
          <span className={styles.splitSeam} aria-hidden="true" />
          {days.map((d) => (
            <div className={`${styles.splitCol} ${d.dayClass}`} key={d.label}>
              <h3 className={styles.dayHead}>
                <span className={styles.dayHeadDay}>{d.label}</span>
                <span className={styles.dayHeadDate}>{d.title}</span>
              </h3>
              <p className={styles.audHeading}>{d.audience.heading}</p>
              <ul className={styles.audItems}>
                {d.audience.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ---- DETAILED TIMETABLE (상세 프로그램) — Day split ------- */}
      <section className={styles.timetable}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>상세 프로그램</h2>
          <span className={styles.sectionMeta}>
            {timetable.day1.date} – {timetable.day2.date}
          </span>
        </div>

        <div className={styles.tableSplit}>
          <span className={styles.splitSeam} aria-hidden="true" />
          {days.map((d) => (
            <div className={`${styles.tableCol} ${d.dayClass}`} key={d.label}>
              <h3 className={styles.dayHead}>
                <span className={styles.dayHeadDay}>{d.label}</span>
                <span className={styles.dayHeadDate}>
                  {d.date} · {d.title}
                </span>
              </h3>
              <ol className={styles.program}>
                {d.rows.map((row, i) => (
                  <ProgramRow key={i} row={row} />
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* ---- BENEFITS (연계 이벤트 및 참가 혜택) ------------------ */}
      <section className={styles.benefits}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>참가 혜택</h2>
          <span className={styles.sectionMeta}>EVENTS &amp; BENEFITS</span>
        </div>
        <div className={styles.benefitsBar} aria-hidden="true" />
        <div className={styles.benefitGroups}>
          {benefits.groups.map((g) => (
            <div className={styles.benefitGroup} key={g.heading}>
              <h3 className={styles.benefitHeading}>{g.heading}</h3>
              <div className={styles.benefitItems}>
                {g.items.map((it) => (
                  <div className={styles.benefitItem} key={it.title}>
                    <h4 className={styles.benefitTitle}>{it.title}</h4>
                    <p className={styles.benefitBody}>{it.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- INFORMATION & VENUE (안내 · 오시는 길) --------------- */}
      <section className={styles.venue}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>안내 · 오시는 길</h2>
          <span className={styles.sectionMeta}>{info.host}</span>
        </div>
        <div className={styles.venueBar} aria-hidden="true" />
        <div className={styles.venueGrid}>
          <div className={styles.venueItem}>
            <span className={styles.venueLabel}>HOST</span>
            <span className={styles.venueValue}>{info.host}</span>
          </div>
          <div className={styles.venueItem}>
            <span className={styles.venueLabel}>CAPACITY</span>
            <span className={styles.venueValue}>일별 150명</span>
            <span className={styles.venueSub}>{info.capacity}</span>
          </div>
          <div className={styles.venueItem}>
            <span className={styles.venueLabel}>PRICE</span>
            <span className={styles.venueValue}>{info.price}</span>
            <span className={styles.venueSub}>일자별 개별 등록</span>
          </div>
          <div className={`${styles.venueItem} ${styles.venueWide}`}>
            <span className={styles.venueLabel}>ADDRESS</span>
            <span className={styles.venueAddr}>{info.address}</span>
          </div>
          <div className={`${styles.venueItem} ${styles.venueWide}`}>
            <span className={styles.venueLabel}>PARKING</span>
            <span className={styles.venueAddr}>{info.parking}</span>
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
            <li className={styles.faqItem} key={i}>
              <h3 className={styles.faqQ}>
                <span className={styles.faqMark} aria-hidden="true">
                  Q
                </span>
                {f.q}
              </h3>
              <p className={styles.faqA}>{f.a}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- APPLY CTA — two per-day registration buttons -------- */}
      <section className={styles.apply}>
        <div className={styles.applyMarquee} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {[0, 1].map((dup) =>
              speakers.map((s) => (
                <span key={`${dup}-${s.id}`} className={styles.marqueeGroup}>
                  <span className={styles.marqueeTitle}>디자인썸머일산</span>
                  <span className={styles.marqueeStudio}>{s.studio}</span>
                </span>
              )),
            )}
          </div>
        </div>
        <div className={styles.applyInner}>
          <h2 className={styles.applyTitle}>{hero.subtitle}</h2>
          <p className={styles.applyNote}>{hero.note}</p>
          <div className={styles.applyBtns}>
            {hero.register.map((r) => (
              <a
                key={r.day}
                className={`${styles.applyBtn} ${r.day === 1 ? styles.dayCool : styles.dayWarm}`}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.applyBtnLabel}>{r.label} →</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
