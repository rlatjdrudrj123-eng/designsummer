"use client";

import { useState } from "react";
import styles from "./Brutalist.module.css";

/* Speaker / poster image. Plain <img>, no effects. If the file is missing
 * (404) or no key resolved, fall back to a hatched placeholder cell so the
 * rigid grid never collapses. */
export default function Photo({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const cls = `${styles.photo} ${className ?? ""}`.trim();
  if (!src || failed) {
    return <div className={`${cls} ${styles.photoEmpty}`} aria-hidden="true" />;
  }
  return (
    <div className={cls}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.photoImg}
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
