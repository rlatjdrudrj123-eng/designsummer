"use client";

import { useState } from "react";
import type { Speaker } from "@/lib/content";
import { imageUrl, workImages } from "@/lib/images";
import styles from "./SpeakerCard.module.css";

/* image with graceful 404 fallback (project convention: plain <img>, no next/image) */
function Img({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />
  );
}

/* Editorial speaker block on white. The multicolor gradient is used as an
   accent rule / index label rather than a single-color fill. Alternating
   left/right alignment is set by the index (caller passes `flip`). */

export default function SpeakerCard({
  speaker,
  index,
  flip = false,
  compact = false,
}: {
  speaker: Speaker;
  index: number;
  flip?: boolean;
  /* half-width column layout: media on top, text below, tighter type */
  compact?: boolean;
}) {
  const profile = imageUrl(`speaker-${speaker.id}`);
  const works = workImages(speaker.id);
  const titleLines = speaker.sessionTitle.split("\n");
  const num = String(index + 1).padStart(2, "0");

  return (
    <article
      id={`sp-${speaker.id}`}
      className={`${styles.card} ${flip ? styles.flip : ""} ${
        compact ? styles.compact : ""
      }`}
    >
      <div className={styles.head}>
        <span className={styles.index}>{num}</span>
        <span className={styles.time}>{speaker.time}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.text}>
          <h3 className={styles.studio}>
            {speaker.studio}
            <span className={styles.studioEn}>{speaker.studioEn}</span>
          </h3>
          <p className={styles.sessionTitle}>
            {titleLines.map((line, i) => (
              <span key={i} className={styles.titleLine}>
                {line}
              </span>
            ))}
          </p>
          <p className={styles.who}>
            <span className={styles.name}>{speaker.name}</span>
            <span className={styles.role}>{speaker.role}</span>
          </p>
          <p className={styles.desc}>{speaker.sessionDesc}</p>
          <ul className={styles.creds}>
            {speaker.credentials.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>

        <div className={styles.media}>
          <div className={`${styles.profile} ${styles.profilePlaceholder}`}>
            <span>{speaker.studioEn}</span>
            {profile && (
              <Img
                src={profile}
                alt={`${speaker.studio} ${speaker.name}`}
                className={styles.profileImg}
              />
            )}

            {/* 대표작 — hovering the photo reveals a clean filmstrip that
                slides up over its lower portion. Empty → nothing renders. */}
            {works.length > 0 && (
              <div className={styles.worksReveal}>
                <span className={styles.worksLabel}>
                  대표작 {String(works.length).padStart(2, "0")}
                </span>
                <div className={styles.worksStrip}>
                  {works.slice(0, 4).map((src) => (
                    <div key={src} className={styles.work}>
                      <Img src={src} alt="" className={styles.workImg} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
