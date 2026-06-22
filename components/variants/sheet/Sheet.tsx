import styles from "./Sheet.module.css";
import Hero from "./Hero";
import Chapter from "./Chapter";
import Lineup from "./Lineup";
import CursorHeat from "./CursorHeat";
import Audience from "./Audience";
import Timetable from "./Timetable";
import Benefits from "./Benefits";
import Directions from "./Directions";
import Apply from "./Apply";
import Faq from "./Faq";
import Footer from "./Footer";
import ScrollCue from "./ScrollCue";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [SHEET 변형] 원본 메인 사이트의 SPECTRAL SHEET 리스킨.
   콘텐츠 전부를 공식 컨퍼런스 데이터(@/lib/conference)로 교체하고,
   라인업 연사만 @/lib/content(speakers)에서 가져온다.

   흐름: HERO → ABOUT(개요 + Day1/Day2) → 추천 대상 → 라인업 → 상세 타임테이블 →
        참가 혜택 → 안내·오시는 길 → FAQ → Footer.

   ★ SHEET 아이덴티티 유지: 프리즘 스펙트럼 필드(LUT) + 커서 열원 +
     인쇄 하프톤 도트 + 고운 종이 그레인. 레이아웃·폰트 그대로.
   self-contained: props 없음, 한 페이지 전체. <main> 래퍼는 호출부가 감싼다. */
export default function Sheet() {
  return (
    <div className={styles.root}>
      <Hero />

      {/* ABOUT — 개요 인트로 + 일자별 챕터 */}
      <section id="about" className={`${styles.about} shell`}>
        <Reveal>
          <p className={styles.aboutTag}>행사 개요</p>
          <p className={styles.aboutIntro}>{conference.about.intro}</p>
        </Reveal>
      </section>
      <Chapter day={1} />
      <Chapter day={2} />

      {/* 추천 대상 */}
      <Audience />

      {/* 라인업 (커서 열원이 각 날의 라인업을 감싼다) */}
      <CursorHeat day={1}>
        <Lineup day={1} />
      </CursorHeat>
      <CursorHeat day={2}>
        <Lineup day={2} />
      </CursorHeat>

      {/* 상세 타임테이블 */}
      <Timetable />

      {/* 참가 혜택 */}
      <Benefits />

      {/* 안내 · 오시는 길 */}
      <Directions />

      {/* 스튜디오 마퀴 */}
      <Apply />

      {/* FAQ */}
      <Faq />

      <Footer />
      <ScrollCue />

      {/* 절제된 인쇄 하프톤 도트 + 고운 종이 그레인 */}
      <div className={styles.halftone} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
    </div>
  );
}
