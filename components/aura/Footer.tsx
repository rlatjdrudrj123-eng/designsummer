import styles from "./Footer.module.css";
import { siteContent } from "@/lib/content";
import { conference } from "@/lib/conference";

/* 푸터 (Aura 전용 포크 — 미니멀). 공유 파일은 수정하지 않는다.
   (forked from components/aura1/Footer.tsx — independent of /aura1.)
   필수 최소 정보만 — 주최(작게)와 문의 메일만 한 줄 톤으로 남긴다. */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <dl className={styles.col}>
        <dt>주최</dt>
        <dd>{conference.info.host}</dd>
      </dl>
      <dl className={styles.col}>
        <dt>문의</dt>
        <dd>
          <a href={`mailto:${siteContent.contact}`}>{siteContent.contact}</a>
        </dd>
      </dl>
    </footer>
  );
}
