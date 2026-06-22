"use client";

import { useState } from "react";
import type { Speaker } from "@/lib/content";
import styles from "./TerminalPage.module.css";

/* One speaker rendered as a console data record / log row. Expands inline to
 * reveal session description + credentials, like opening a record in a TUI. */
export default function SpeakerRow({
  speaker,
  heat,
  photo,
}: {
  speaker: Speaker;
  heat: number;
  photo: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const recId = `REC-${speaker.day}${String(speaker.order).padStart(2, "0")}`;
  // session title can contain a newline in the data
  const title = speaker.sessionTitle.split("\n");

  return (
    <div className={`${styles.rec} ${open ? styles.recOpen : ""}`}>
      <button
        type="button"
        className={styles.recHead}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.recId}>{recId}</span>
        <span className={styles.recAvatar} aria-hidden="true">
          {photo && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt=""
              onError={() => setImgFailed(true)}
              className={styles.recAvatarImg}
            />
          ) : (
            <span className={styles.recAvatarPh}>{speaker.name.slice(0, 1)}</span>
          )}
        </span>
        <span className={styles.recMain}>
          <span className={styles.recStudio}>
            {speaker.studio}
            <span className={styles.recStudioEn}>{speaker.studioEn}</span>
          </span>
          <span className={styles.recName}>
            {speaker.name} · <span className={styles.recRole}>{speaker.role}</span>
          </span>
          <span className={styles.recTitle}>
            {title.map((t, i) => (
              <span key={i} className={styles.recTitleLine}>
                {t}
              </span>
            ))}
          </span>
        </span>
        <span className={styles.recMeta}>
          <span className={styles.recTime}>{speaker.time}</span>
          <span className={styles.recHeat}>
            <span className={styles.recHeatNum}>{heat}</span>
            <span className={styles.recHeatUnit}>°C</span>
          </span>
          <span className={styles.recToggle}>{open ? "[ − ]" : "[ + ]"}</span>
        </span>
      </button>

      {open && (
        <div className={styles.recBody}>
          <p className={styles.recDesc}>{speaker.sessionDesc}</p>
          <ul className={styles.recCreds}>
            {speaker.credentials.map((c, i) => (
              <li key={i}>
                <span className={styles.bullet}>›</span>
                {c}
              </li>
            ))}
          </ul>
          {speaker.url && (
            <a
              className={styles.recLink}
              href={speaker.url}
              target="_blank"
              rel="noreferrer"
            >
              OPEN ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
