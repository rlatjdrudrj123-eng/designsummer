"use client";

import { useState } from "react";
import styles from "./SerifPage.module.css";

/* Editorial portrait — quiet, no effects. Falls back to a paper-toned frame
   with the studio initial if the image is missing or 404s. */
export default function SerifPhoto({
  src,
  alt,
  initial,
}: {
  src: string | null;
  alt: string;
  initial: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`${styles.portrait} ${styles.portraitEmpty}`} aria-hidden>
        <span className={styles.portraitInitial}>{initial}</span>
      </div>
    );
  }
  return (
    <div className={styles.portrait}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.portraitImg}
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
