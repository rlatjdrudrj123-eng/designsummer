import styles from "./Footer.module.css";
import { siteContent } from "@/lib/content";
import { conference } from "@/lib/conference";

/* 푸터 (Aura1 전용 포크 — 미니멀). 공유 파일은 수정하지 않는다.

   클라이언트 피드백 반영:
   - 하단 큰 영문 워드마크("K·print × Design Summer") 제거.
   - 카피라이트(© 2026 …) 라인 제거.
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
