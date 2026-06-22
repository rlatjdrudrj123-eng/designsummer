"use client";

import { useState } from "react";
import styles from "./Lineup.module.css";

/* [HEATMAP 변형] 원본 components/sections/SpeakerPhoto.tsx 클론 (변경 없음).
   연사 사진 — PNG 그대로. 파일이 없으면(404) 자리표시 프레임으로 폴백. */
export default function SpeakerPhoto({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className={styles.photo} />;
  return (
    <div className={`${styles.photo} ${styles.hasImg}`}>
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
