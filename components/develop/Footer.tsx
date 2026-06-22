import styles from "./Footer.module.css";
import { siteContent } from "@/lib/content";

/* 푸터 (가이드 8장) — 주최, 문의. 따뜻한 Aura 톤 & 매너.
   en 모드여도 콘텐츠는 한국어(ko 와 동일) — en 은 히어로 KV 타이틀만 영문이다. */
export default function Footer() {
  return (
    <footer className={`${styles.footer} shell`}>
      <p className={styles.wordmark}>
        K&middot;print<span>×</span>Design Summer
      </p>
      <div className={styles.cols}>
        <dl className={styles.col}>
          <dt>주최</dt>
          <dd>{siteContent.host}</dd>
        </dl>
        <dl className={styles.col}>
          <dt>장소</dt>
          <dd>{siteContent.venue}</dd>
        </dl>
        <dl className={styles.col}>
          <dt>문의</dt>
          <dd>
            <a href={`mailto:${siteContent.contact}`}>{siteContent.contact}</a>
          </dd>
        </dl>
      </div>
      <p className={styles.legal}>© 2026 {siteContent.host}</p>
    </footer>
  );
}
