"use client";

import { useState } from "react";
import styles from "./Kinetic.module.css";

/* Speaker photo with a graceful fallback frame when the image is missing or
 * 404s (images come from @/lib/images and may be unuploaded). Self-contained
 * to this concept folder. */
export default function KineticPhoto({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`${styles.photo} ${styles.photoEmpty}`} aria-hidden />;
  }
  return (
    <div className={styles.photo}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.photoImg}
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
