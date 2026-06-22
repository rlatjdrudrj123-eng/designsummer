import styles from "./Process.module.css";
import Hero from "./Hero";
import About from "./About";
import Audience from "./Audience";
import Lineup from "./Lineup";
import CursorHeat from "./CursorHeat";
import Timetable from "./Timetable";
import Benefits from "./Benefits";
import Directions from "./Directions";
import Apply from "./Apply";
import Faq from "./Faq";
import Footer from "./Footer";
import ScrollCue from "./ScrollCue";

/* [PROCESS · CMYK 변형 — tab "CMYK"]
   원본 메인 사이트의 클론을, CMYK 인쇄 잉크 리스킨 위에서 공식 컨퍼런스 콘텐츠로 채운다.
   콘텐츠는 전부 @/lib/conference (conference) + 라인업 연사는 @/lib/content.

   섹션 순서:
     HERO → ABOUT(행사 개요) → 추천 대상 → 라인업(D1·D2) → 상세 타임테이블 →
     참가 혜택 → 안내·오시는 길 → FAQ → Footer.

   ★ CMYK 아이덴티티 유지: 흰 종이 위 C·M·Y 감산잉크 덩어리(겹치면 K) + 커서 잉크.
     - 히어로 = 전 화면 CMYK-on-white 필드(HeatBlob).
     - 라인업 구간을 CursorHeat 가 감싸 커서 잉크 번짐 유지(Day1 시안 / Day2 마젠타).
     - 그리드 라인·격자 없음. 폰트·레이아웃·모션 그대로.
   하드코딩 충돌 카피("from idea to ink" / 열원·전사 챕터 등)는 제거.

   self-contained: props 없음, 한 페이지 전체. <main> 래퍼는 호출부가 감싼다. */
export default function Process() {
  return (
    <div className={styles.root}>
      <Hero />
      <About />
      <Audience />
      <CursorHeat day={1}>
        <Lineup day={1} />
      </CursorHeat>
      <CursorHeat day={2}>
        <Lineup day={2} />
      </CursorHeat>
      <Timetable />
      <Benefits />
      <Directions />
      <Apply />
      <Faq />
      <Footer />
      <ScrollCue />
    </div>
  );
}
