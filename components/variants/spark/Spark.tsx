"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Fontdiner_Swanky } from "next/font/google";
import { speakers, type Speaker } from "@/lib/content";
import { imageUrl, workImages } from "@/lib/images";
import { conference, type TimetableRow } from "@/lib/conference";
import Sparkle from "./Sparkle";
import styles from "./Spark.module.css";

const swanky = Fontdiner_Swanky({
  subsets: ["latin"],
  weight: "400",
  variable: "--sp-swanky",
  display: "swap",
});

/* ── speaker lookup by Korean studio name (enrich timetable rows with
   the uploaded portrait + credentials from content/speakers.json) ──── */
const SPEAKER_BY_STUDIO = new Map<string, Speaker>(
  speakers.map((s) => [s.studio, s])
);

/* ── hero starfield (curated to the empty top band + edges) ──── */

// Stars are deliberately kept OUT of the title's optical zone.
// The huge DESIGN/SUMMER/ILSAN title is vertically centered & left-aligned
// inside .heroMain; the index columns sit just under it and the date+venue
// group lives bottom-right. So we cluster stars in:
//   • the top band (above the title, roughly y < 16%)
//   • the far-right gutter (right of the left-aligned title)
//   • the very corners
// The cursor-reactive layer measures real geometry (getBoundingClientRect),
// so stars only need their visual placement here.
type HeroStar = {
  size: number;
  points: number;
  phase: number;
  variant?: "plain" | "bang" | "query";
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
};

// top band reads left→right; right gutter + corners fill the dead space.
const HERO_STARS: HeroStar[] = [
  // ── top band (clear of the title which starts lower) ──
  { size: 96, points: 10, phase: 0, variant: "bang", top: "3%", left: "4%" },
  { size: 64, points: 8, phase: 1.3, top: "2%", left: "24%" },
  { size: 110, points: 10, phase: 0.6, top: "-2%", left: "45%" },
  { size: 58, points: 8, phase: 2.1, variant: "query", top: "6%", left: "63%" },
  { size: 84, points: 10, phase: 1.7, top: "1%", right: "6%" },
  // ── right gutter (right of the left-aligned title block) ──
  { size: 70, points: 8, phase: 0.9, top: "34%", right: "5%" },
  { size: 44, points: 8, phase: 2.6, top: "52%", right: "9%" },
  // ── corners ──
  { size: 40, points: 8, phase: 3.0, top: "13%", left: "1%" },
  { size: 34, points: 8, phase: 1.1, bottom: "8%", left: "3%" },
];

function HeroSparkleLayer() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return; // no trail / no spawning under reduced motion

    const layer = layerRef.current;
    if (!layer) return;
    const hero = layer.parentElement;
    if (!hero) return;

    // hero stars that should react to cursor proximity (twinkle harder/scale)
    const starEls = Array.from(
      hero.querySelectorAll<HTMLElement>(`.${styles.heroStar}`)
    );
    const starCenters = () =>
      starEls.map((el) => {
        const r = el.getBoundingClientRect();
        const hr = hero.getBoundingClientRect();
        return { cx: r.left - hr.left + r.width / 2, cy: r.top - hr.top + r.height / 2 };
      });
    let centers = starCenters();
    const onResize = () => {
      centers = starCenters();
    };
    window.addEventListener("resize", onResize);

    // ── pooled sparkle nodes (capped) ──
    const POOL = 18;
    type Node = {
      el: HTMLSpanElement;
      active: boolean;
      x: number;
      y: number;
      born: number;
      life: number; // ms
      rot: number;
      drift: number; // px upward float over life
    };
    const nodes: Node[] = [];
    for (let i = 0; i < POOL; i++) {
      const el = document.createElement("span");
      el.className = styles.trailSpark;
      el.setAttribute("aria-hidden", "true");
      // tiny 4-point yellow sparkle, drawn with the same identity color
      el.innerHTML =
        '<svg viewBox="0 0 24 24" width="100%" height="100%">' +
        '<path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" ' +
        'fill="var(--sp-yellow)"/></svg>';
      el.style.opacity = "0";
      layer.appendChild(el);
      nodes.push({
        el,
        active: false,
        x: 0,
        y: 0,
        born: 0,
        life: 1,
        rot: 0,
        drift: 0,
      });
    }
    let cursor = 0;

    function spawn(x: number, y: number, big: boolean) {
      const n = nodes[cursor];
      cursor = (cursor + 1) % POOL;
      n.active = true;
      n.x = x;
      n.y = y;
      n.born = performance.now();
      n.life = big ? 620 : 480 + Math.random() * 160;
      n.rot = (Math.random() - 0.5) * 220;
      n.drift = 10 + Math.random() * 22;
      const base = big ? 16 : 8 + Math.random() * 7;
      n.el.style.width = `${base}px`;
      n.el.style.height = `${base}px`;
    }

    // ── pointer tracking, sampled by rAF (throttled) ──
    let px = 0;
    let py = 0;
    let inside = false;
    let moved = false;
    let lastSpawn = 0;

    const toLocal = (clientX: number, clientY: number) => {
      const r = hero.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top };
    };

    const onMove = (e: PointerEvent) => {
      const { x, y } = toLocal(e.clientX, e.clientY);
      px = x;
      py = y;
      inside = true;
      moved = true;
    };
    const onLeave = () => {
      inside = false;
    };
    const onDown = (e: PointerEvent) => {
      const { x, y } = toLocal(e.clientX, e.clientY);
      // little celebratory burst on click/tap
      for (let i = 0; i < 7; i++) {
        const a = (Math.PI * 2 * i) / 7 + Math.random() * 0.5;
        const d = 4 + Math.random() * 10;
        spawn(x + Math.cos(a) * d, y + Math.sin(a) * d, true);
      }
    };

    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    hero.addEventListener("pointerdown", onDown);

    // ── single rAF loop drives spawning + animation ──
    let raf = 0;
    const REACT_R = 200; // px radius within which stars energize
    const tick = (t: number) => {
      // spawn along the pointer path while moving inside the hero
      if (inside && moved && t - lastSpawn > 45) {
        spawn(px, py, false);
        lastSpawn = t;
        moved = false;
      }

      // hero stars react to cursor proximity: scale up + spin + glow
      for (let i = 0; i < starEls.length; i++) {
        const c = centers[i];
        let energy = 0;
        if (inside) {
          const dx = px - c.cx;
          const dy = py - c.cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          energy = Math.max(0, 1 - dist / REACT_R);
        }
        // smooth toward target so it eases in/out as the cursor passes
        const star = starEls[i] as HTMLElement & { _e?: number };
        const prev = star._e ?? 0;
        const next = prev + (energy - prev) * 0.18;
        star._e = next;
        star.style.setProperty("--sp-energy", next.toFixed(3));
      }
      for (const n of nodes) {
        if (!n.active) continue;
        const age = t - n.born;
        const p = age / n.life;
        if (p >= 1) {
          n.active = false;
          n.el.style.opacity = "0";
          continue;
        }
        // ease-out fade, gentle upward float + spin
        const eased = 1 - (1 - p) * (1 - p);
        const opacity = p < 0.18 ? p / 0.18 : 1 - (p - 0.18) / 0.82;
        const ty = -n.drift * eased;
        const s = 0.4 + 0.6 * (1 - p);
        n.el.style.transform =
          `translate(${n.x}px, ${n.y + ty}px) translate(-50%, -50%) ` +
          `rotate(${n.rot * eased}deg) scale(${s})`;
        n.el.style.opacity = String(Math.max(0, opacity));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      hero.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onResize);
      for (const s of starEls) s.style.removeProperty("--sp-energy");
      for (const n of nodes) n.el.remove();
    };
  }, []);

  return (
    <div ref={layerRef} className={styles.trailLayer} aria-hidden="true" />
  );
}

/* ── hover sparkle burst (behind the portrait) ─────────────── */

// fixed spark layout (a few stars), igniting on hover and settling.
type HoverSpark = {
  size: number;
  points: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  variant?: "plain" | "bang" | "query";
  d: number; // stagger delay (ms)
};
const HOVER_SPARKS: HoverSpark[] = [
  { size: 60, points: 10, top: "6%", left: "8%", variant: "bang", d: 0 },
  { size: 38, points: 8, top: "14%", right: "10%", d: 60 },
  { size: 30, points: 8, top: "44%", left: "-4%", d: 120 },
  { size: 46, points: 10, bottom: "16%", right: "2%", d: 90 },
  { size: 26, points: 8, bottom: "8%", left: "16%", d: 150 },
];

function HoverSparks({ on }: { on: boolean }) {
  return (
    <div
      className={`${styles.cardSparks} ${on ? styles.cardSparksOn : ""}`}
      aria-hidden="true"
    >
      {HOVER_SPARKS.map((sp, i) => (
        <span
          key={i}
          className={styles.cardSpark}
          style={{
            top: sp.top,
            left: sp.left,
            right: sp.right,
            bottom: sp.bottom,
            // stagger the ignition
            transitionDelay: on ? `${sp.d}ms` : "0ms",
          }}
        >
          <Sparkle
            size={sp.size}
            points={sp.points}
            variant={sp.variant ?? "plain"}
            className={styles.cardSparkStar}
          />
        </span>
      ))}
    </div>
  );
}

/* ── speaker modal (expanded view — opened from an enriched session row) ── */

function SpeakerModal({
  s,
  onClose,
}: {
  s: Speaker;
  onClose: () => void;
}) {
  const works = workImages(s.id);
  const photo = imageUrl(`speaker-${s.id}`);
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab") {
        // simple focus trap within the dialog
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className={styles.modalScrim} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          ref={closeRef}
          aria-label="닫기"
        >
          ✕
        </button>

        <div className={styles.modalHead}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.modalPortrait}
              src={photo}
              alt={`${s.studio} ${s.name}`}
            />
          )}
          <div>
            <span className={styles.modalKicker}>
              DAY {s.day} · {String(s.order).padStart(2, "0")} · {s.time}
            </span>
            <h3 id={titleId} className={styles.modalStudio}>
              {s.studio}
              <span className={styles.cardStudioEn}> · {s.studioEn}</span>
            </h3>
            <p className={styles.modalName}>
              {s.name} <span className={styles.cardRole}>{s.role}</span>
            </p>
            <p className={styles.modalTitle}>
              {s.sessionTitle.replace(/\n/g, " ")}
            </p>
          </div>
        </div>

        {works.length > 0 && (
          <div className={styles.modalWorks}>
            {works.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                className={styles.modalWork}
                src={src}
                alt={`${s.studio} 대표작 ${i + 1}`}
                loading="lazy"
              />
            ))}
          </div>
        )}

        <p className={styles.modalDesc}>{s.sessionDesc}</p>

        <ul className={styles.modalCreds}>
          {s.credentials.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>

        {s.url && (
          <a
            className={styles.modalLink}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {s.studioEn} ↗
          </a>
        )}
      </div>
    </div>
  );
}

/* ── timetable row ─────────────────────────────────────────── */

function TimeRow({
  row,
  onOpen,
}: {
  row: TimetableRow;
  onOpen: (s: Speaker) => void;
}) {
  const kind = row.kind ?? "session";

  // registration / coffee-break rows: muted, single-line marker
  if (kind !== "session") {
    return (
      <li
        className={`${styles.timeRow} ${styles.timeRowMuted}`}
        data-kind={kind}
      >
        <span className={styles.timeSlot}>{row.time}</span>
        <span className={styles.timeMutedLabel}>
          {kind === "reg" ? "REG" : "BREAK"}
        </span>
        <span className={styles.timeMutedTitle}>{row.title}</span>
      </li>
    );
  }

  // session row — enrich with portrait + credentials when we can match the studio
  const sp = row.studio ? SPEAKER_BY_STUDIO.get(row.studio) ?? null : null;
  const photo = sp ? imageUrl(`speaker-${sp.id}`) : null;
  const [hover, setHover] = useState(false);

  const open = useCallback(() => {
    if (sp) onOpen(sp);
  }, [onOpen, sp]);

  const interactive = !!sp;

  return (
    <li
      className={`${styles.timeRow} ${styles.timeRowSession} ${
        interactive ? styles.timeRowInteractive : ""
      }`}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-haspopup={interactive ? "dialog" : undefined}
      aria-label={
        interactive ? `${row.studio} ${sp?.name} — 자세히 보기` : undefined
      }
      onClick={interactive ? open : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open();
              }
            }
          : undefined
      }
    >
      <span className={styles.timeSlot}>{row.time}</span>

      <span className={styles.timeMedia} aria-hidden="true">
        <HoverSparks on={hover} />
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" loading="lazy" />
        ) : (
          <span className={styles.timeMediaFallback}>
            <Sparkle size={28} points={8} className={styles.cardFallbackStar} />
          </span>
        )}
      </span>

      <div className={styles.timeText}>
        <span className={styles.timeStudio}>
          {row.studio}
          {sp && (
            <span className={styles.cardStudioEn}> · {sp.studioEn}</span>
          )}
        </span>
        <span className={styles.timeTitle}>{row.title}</span>
        {row.desc && <span className={styles.timeDesc}>{row.desc}</span>}
        <span className={styles.timeName}>
          {row.speaker}
          {interactive && (
            <span className={styles.timeMore} aria-hidden="true">
              {" "}· 약력·대표작 보기 ↗
            </span>
          )}
        </span>
      </div>
    </li>
  );
}

/* ── section title helper (DESIGN/SUMMER big serif split) ──── */

function SectionTitle({
  yellow,
  white,
  id,
  sub,
}: {
  yellow: string;
  white?: string;
  id?: string;
  sub?: string;
}) {
  return (
    <div className={styles.sectionHead}>
      <h2 id={id} className={styles.sectionTitle}>
        <span className={styles.titleYellow}>{yellow}</span>
        {white && <span className={styles.titleWhite}>{white}</span>}
      </h2>
      {sub && <p className={styles.sectionSub}>{sub}</p>}
    </div>
  );
}

/* ── main component ────────────────────────────────────────── */

export default function Spark() {
  const { hero, about, audience, timetable, benefits, info, faq } = conference;

  const [active, setActive] = useState<Speaker | null>(null);
  const openCard = useCallback((s: Speaker) => setActive(s), []);
  const closeCard = useCallback(() => setActive(null), []);

  return (
    <div className={`${styles.root} ${swanky.variable}`}>
      {/* ============ HERO ============ */}
      <header className={styles.hero}>
        <div className={styles.starfield} aria-hidden="true">
          {HERO_STARS.map((st, i) => (
            <span
              key={i}
              className={styles.heroStar}
              style={
                {
                  top: st.top,
                  left: st.left,
                  right: st.right,
                  bottom: st.bottom,
                } as CSSProperties
              }
            >
              <Sparkle
                size={st.size}
                points={st.points}
                phase={st.phase}
                variant={st.variant}
                className={styles.heroStarInner}
              />
            </span>
          ))}
        </div>
        <HeroSparkleLayer />

        <div className={styles.heroShell}>
          <div className={styles.heroTopBar}>
            <span className={styles.tagline}>
              CATCH THE <span className={styles.taglineHot}>SPARKLING</span> IDEA
            </span>
            <span className={styles.wordmark}>K·print</span>
          </div>

          <div className={styles.heroMain}>
            <span className={styles.heroBadge}>{hero.badge}</span>
            <h1 className={styles.heroTitle}>
              <span className={styles.titleYellow}>디자인</span>
              <span className={styles.titleYellow}>썸머</span>
              <span className={styles.titleWhite}>일산</span>
            </h1>
            <p className={styles.heroSubtitle}>{hero.subtitle}</p>
            <p className={styles.heroDesc}>{hero.desc}</p>

            <ul className={styles.heroFacts}>
              <li>
                <span className={styles.heroFactLabel}>일시</span>
                <span className={styles.heroFactValue}>{hero.date}</span>
              </li>
              <li>
                <span className={styles.heroFactLabel}>장소</span>
                <span className={styles.heroFactValue}>{hero.venue}</span>
              </li>
            </ul>

            <div className={styles.heroCtas}>
              {hero.register.map((r) => (
                <a
                  key={r.day}
                  className={styles.heroCta}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Sparkle
                    size={20}
                    points={8}
                    className={styles.heroCtaStar}
                  />
                  {r.label}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.heroFoot}>
            <span className={styles.heroDates}>2026. 08.20 – 08.21</span>
            <span className={styles.heroVenue}>KINTEX</span>
          </div>
        </div>
      </header>

      {/* ============ ABOUT (행사 개요) ============ */}
      <section className={styles.intro} aria-labelledby="sp-about-h">
        <div className={styles.introInner}>
          <span className={styles.kicker}>
            <Sparkle size={18} points={8} className={styles.inlineStar} />
            ABOUT
          </span>
          <h2 id="sp-about-h" className={styles.introLead}>
            Catch the <span className={styles.introLeadHot}>sparkling</span> idea
          </h2>
          <p className={styles.introBody}>{about.intro}</p>

          <div className={styles.conceptRow}>
            {about.days.map((d) => (
              <div key={d.day} className={styles.conceptCard}>
                <span className={styles.conceptEn}>
                  DAY {d.day} · {d.date}
                </span>
                <h3 className={styles.conceptTitle}>{d.title}</h3>
                <p className={styles.conceptBody}>{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ AUDIENCE (추천 대상) ============ */}
      <section className={styles.audience} aria-labelledby="sp-aud-h">
        <SectionTitle id="sp-aud-h" yellow="추천" white="대상" />
        <div className={styles.audienceGrid}>
          {(
            [
              { day: 1, ...audience.day1 },
              { day: 2, ...audience.day2 },
            ] as const
          ).map((a) => (
            <div key={a.day} className={styles.audienceCard}>
              <span className={styles.audienceDay}>DAY {a.day}</span>
              <h3 className={styles.audienceHeading}>{a.heading}</h3>
              <ul className={styles.audienceList}>
                {a.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ============ TIMETABLE (상세 프로그램) ============ */}
      <section className={styles.timetable} aria-labelledby="sp-time-h">
        <SectionTitle
          id="sp-time-h"
          yellow="TIME"
          white="TABLE"
          sub="상세 프로그램 · 8 studios · 8 sessions"
        />
        <div className={styles.timeCols}>
          {[timetable.day1, timetable.day2].map((dayBlock) => (
            <div key={dayBlock.day} className={styles.timeCol}>
              <h3 className={styles.timeColHead}>
                DAY {dayBlock.day} — {dayBlock.date}
                <span className={styles.timeColTheme}>{dayBlock.title}</span>
              </h3>
              <ul className={styles.timeList}>
                {dayBlock.rows.map((row, i) => (
                  <TimeRow key={i} row={row} onOpen={openCard} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ============ BENEFITS (참가 혜택) ============ */}
      <section className={styles.benefits} aria-labelledby="sp-ben-h">
        <SectionTitle
          id="sp-ben-h"
          yellow="참가"
          white="혜택"
          sub="연계 이벤트 및 참가 혜택"
        />
        <div className={styles.benefitGroups}>
          {benefits.groups.map((g, gi) => (
            <div key={gi} className={styles.benefitGroup}>
              <h3 className={styles.benefitGroupHead}>
                <span className={styles.benefitBullet} aria-hidden="true">
                  <Sparkle
                    size={18}
                    points={8}
                    className={styles.inlineStar}
                  />
                </span>
                {g.heading}
              </h3>
              <div className={styles.benefitItems}>
                {g.items.map((it, ii) => (
                  <div key={ii} className={styles.benefitCard}>
                    <h4 className={styles.benefitTitle}>{it.title}</h4>
                    <p className={styles.benefitBody}>{it.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ INFO / VENUE (안내 · 오시는 길) ============ */}
      <section className={styles.venue} aria-labelledby="sp-info-h">
        <div className={styles.venueInner}>
          <div className={styles.venueInfo}>
            <h2 id="sp-info-h" className={styles.venueTitle}>
              안내 · 오시는 길
            </h2>
            <dl className={styles.venueList}>
              <div>
                <dt>주최</dt>
                <dd>{info.host}</dd>
              </div>
              <div>
                <dt>참가비</dt>
                <dd>{info.price}</dd>
              </div>
              <div>
                <dt>정원</dt>
                <dd>{info.capacity}</dd>
              </div>
              <div>
                <dt>주소</dt>
                <dd>{info.address}</dd>
              </div>
              <div>
                <dt>주차</dt>
                <dd>{info.parking}</dd>
              </div>
            </dl>
          </div>
          <div className={styles.applyBox}>
            <Sparkle
              size={64}
              points={10}
              variant="bang"
              className={styles.applyStar}
            />
            <p className={styles.applyNote}>
              일자별 개별 등록 · 좌석이 한정되어 있습니다
            </p>
            <div className={styles.applyCtas}>
              {hero.register.map((r) => (
                <a
                  key={r.day}
                  className={styles.applyCta}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {r.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className={styles.faq} aria-labelledby="sp-faq-h">
        <SectionTitle id="sp-faq-h" yellow="FAQ" />
        <div className={styles.faqList}>
          {faq.map((f, i) => (
            <details key={i} className={styles.faqItem}>
              <summary className={styles.faqQ}>
                <span className={styles.faqMark} aria-hidden="true">
                  <Sparkle
                    size={16}
                    points={8}
                    className={styles.inlineStar}
                  />
                </span>
                {f.q}
              </summary>
              <p className={styles.faqA}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerMark}>
            <span className={styles.titleYellow}>디자인</span>{" "}
            <span className={styles.titleWhite}>썸머</span>
          </span>
          <div className={styles.footerMeta}>
            <span>{info.host}</span>
            <span>{hero.venue}</span>
          </div>
        </div>
      </footer>

      {active && <SpeakerModal s={active} onClose={closeCard} />}
    </div>
  );
}
