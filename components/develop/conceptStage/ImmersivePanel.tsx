"use client";

import { useEffect, useRef } from "react";
import styles from "./ImmersivePanel.module.css";
import { type Speaker } from "@/lib/content";
import { imageUrl, showcaseImages } from "@/lib/images";

/**
 * ImmersivePanel — ONE near-full-viewport, full-bleed panel per speaker.
 *
 * Composition (big-type-on-aura): a GIANT warm tonal STUDIO NAME (huge display
 * type with a gradient text-clip in the day's warm tones) sits behind / beside
 * ONE large work image, with the session title + a little supporting text
 * (name / role) layered for legibility. Panels alternate side (image left /
 * right) so scrolling reads as a cinematic sequence rather than a list.
 *
 * The giant studio name is sized to MELT into the continuous warm aura ground
 * (it shares the day's tonal gradient), but kept LEGIBLE via a high-contrast
 * tonal gradient + a soft warm ink drop and a faint frosted plate behind the
 * smaller copy.
 *
 * Motion (rAF, no libraries): as the panel travels through the viewport we set
 * a CSS var --p (0..1 of how far it has crossed) used for a gentle parallax on
 * the giant name + image and a one-shot reveal blur/opacity. prefers-reduced-
 * motion: no rAF, everything painted in its resting (fully-revealed) state.
 */

function usePanelProgress(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      // resting state: fully revealed, no parallax offset.
      el.style.setProperty("--p", "0.5");
      el.style.setProperty("--in", "1");
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // progress 0 when the panel top is at the viewport bottom, 1 when the
      // panel bottom has risen to the viewport top — the panel's full travel.
      const travelled = vh - r.top;
      const total = r.height + vh;
      const p = travelled / total;
      const clamped = p < 0 ? 0 : p > 1 ? 1 : p;
      el.style.setProperty("--p", String(clamped));
      // reveal: ease in as the panel enters from the bottom third, hold at 1.
      const inP = (clamped - 0.08) / 0.32;
      const inClamped = inP < 0 ? 0 : inP > 1 ? 1 : inP;
      el.style.setProperty("--in", String(inClamped));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref]);
}

export default function ImmersivePanel({
  s,
  index,
}: {
  s: Speaker;
  index: number;
}) {
  const ref = useRef<HTMLElement>(null);
  usePanelProgress(ref);

  // ONE large work image: prefer the session poster / showcase, then portrait.
  const showcase = showcaseImages(s.id);
  const hero = showcase[0] ?? imageUrl(`speaker-${s.id}`);
  const titleLines = s.sessionTitle.split("\n");
  // alternate the image side per panel for a cinematic rhythm.
  const flip = index % 2 === 1;

  return (
    <article
      ref={ref}
      className={`${styles.panel} ${flip ? styles.flip : ""} ${
        s.day === 1 ? styles.d1 : styles.d2
      }`}
      aria-label={`${s.studio} ${s.name}`}
    >
      {/* GIANT tonal studio name — melts into the aura, sits behind the image */}
      <div className={styles.bigType} aria-hidden="true">
        <span className={styles.bigStudio}>{s.studioEn}</span>
      </div>

      <div className={styles.stageGrid}>
        {/* ONE large work image, dramatically scaled */}
        <div className={styles.media}>
          {hero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.mediaImg}
              src={hero}
              alt={`${s.studio} 대표작`}
              loading="lazy"
            />
          ) : (
            <div className={styles.mediaPh} aria-hidden="true">
              {s.studioEn.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* copy block — kept on a faint frosted plate for legibility on aura */}
        <div className={styles.copy}>
          <p className={styles.kicker}>
            <span className={styles.idx}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className={styles.studioKo}>{s.studio}</span>
            <span className={styles.time}>{s.time}</span>
          </p>
          <h3 className={styles.session}>
            {titleLines.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </h3>
          <p className={styles.sessionDesc}>{s.sessionDesc}</p>
          <p className={styles.person}>
            <b>{s.name}</b>
            <span>{s.role}</span>
          </p>
          {s.credentials.length > 0 && (
            <ul className={styles.creds}>
              {s.credentials.slice(0, 3).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
