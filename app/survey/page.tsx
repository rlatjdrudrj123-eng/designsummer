import type { Metadata } from "next";
import Link from "next/link";
import AnimalTest from "@/components/aura/AnimalTest";
import { getTeaserPolls } from "@/lib/testStats";
import { KPRINT_REGISTER_URL } from "@/lib/animalTest";
import { getManifestCached } from "@/lib/serverImages";
import { imageUrl } from "@/lib/images";
import styles from "./page.module.css";

/* /survey — 동물상 테스트 전용 페이지(뉴스레터 랜딩).
   행사 종료로 홈(통스크롤)이 아닌 테스트만 있는 단독 페이지로 분리.
   진입 화면에서 "내 온도 알아보기"를 눌러야 모달이 열린다(자동 오픈 X). */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "디자이너 동물상 테스트 · 디자인 썸머 일산",
  description:
    "동물상으로 알아보는 내 작업온도. 현직 디자이너들이 증명한 리얼 데이터 기반 성향 테스트.",
  alternates: { canonical: "/survey" },
};

export default async function SurveyPage() {
  const polls = await getTeaserPolls();
  // 헤더 우측 K·print 로고 — 어드민 업로드(kprint-logo) 있으면 이미지, 없으면 워드마크.
  const manifest = await getManifestCached();
  const logoSrc = imageUrl("kprint-logo", manifest);

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <div className={styles.headInner}>
          <Link href="/" className={styles.brand}>
            디자인 썸머 일산
          </Link>
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.logo} src={logoSrc} alt="K·print" />
          ) : (
            <span className={styles.logo} aria-label="K·print">
              K&middot;print
            </span>
          )}
        </div>
      </header>

      <div className={styles.body}>
        <AnimalTest polls={polls} variant="page" />
      </div>

      <footer className={styles.foot}>
        <Link href="/" className={styles.footBtn}>
          디자인 썸머 일산 바로가기 <span aria-hidden="true">→</span>
        </Link>
        <a
          href={KPRINT_REGISTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.footBtn} ${styles.footBtnAlt}`}
        >
          K-PRINT 2026 바로가기 <span aria-hidden="true">→</span>
        </a>
      </footer>
    </main>
  );
}
