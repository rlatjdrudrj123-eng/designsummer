"use client";

import { useState } from "react";
import styles from "./Lineup.module.css";
import Reveal from "./Reveal";
import Parallax from "./Parallax";
import SpeakerPhoto from "./SpeakerPhoto";
import SpeakerModal from "./SpeakerModal";
import { speakersByDay, type Speaker } from "@/lib/content";
import { imageUrl } from "@/lib/images";

/* [HEATMAP 변형] 원본 components/sections/Lineup.tsx 클론 — 구조·카피·인터랙션 동일.
   지그재그 편집형. 호버/포커스 시 사진 뒤 열 번짐 + "대표작 보기 →". 클릭 시 모달. */
function Entry({
  s,
  index,
  onOpen,
}: {
  s: Speaker;
  index: number;
  onOpen: (s: Speaker) => void;
}) {
  const profile = imageUrl(`speaker-${s.id}`);
  const flip = index % 2 === 1; // 홀수 행은 좌우 교차

  const open = () => onOpen(s);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  return (
    <Reveal
      className={`${styles.entry} ${flip ? styles.flip : ""} ${
        s.day === 1 ? styles.d1 : styles.d2
      }`}
    >
      <div
        className={styles.card}
        role="button"
        tabIndex={0}
        aria-label={`${s.studio} ${s.name} — 대표작 보기`}
        onClick={open}
        onKeyDown={onKey}
      >
        <Parallax speed={0.08} className={styles.photoWrap}>
          <span className={styles.bloom} aria-hidden="true" />
          <SpeakerPhoto src={profile} alt={`${s.studio} ${s.name}`} />
        </Parallax>

        <div className={styles.text}>
          <span className={styles.num}>{String(s.order).padStart(2, "0")}</span>
          <h2 className={styles.studio}>{s.studio}</h2>
          <span className={styles.studioEn}>{s.studioEn}</span>
          <p className={styles.session}>{s.sessionTitle}</p>
          <p className={styles.person}>
            {s.name}
            {s.role ? <span className={styles.role}> · {s.role}</span> : null}
          </p>
          {s.credentials.length > 0 ? (
            <ul className={styles.creds}>
              {s.credentials.slice(0, 3).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          ) : null}
          <span className={styles.prompt}>대표작 보기 →</span>
        </div>
      </div>
    </Reveal>
  );
}

export default function Lineup({ day }: { day: 1 | 2 }) {
  const list = speakersByDay(day);
  const [active, setActive] = useState<Speaker | null>(null);

  return (
    <section
      id={`lineup${day}`}
      className={`${styles.lineup} shell`}
      aria-label={`Day ${day} 라인업`}
    >
      {list.map((s, i) => (
        <Entry key={s.id} s={s} index={i} onOpen={setActive} />
      ))}
      {active ? (
        <SpeakerModal speaker={active} onClose={() => setActive(null)} />
      ) : null}
    </section>
  );
}
