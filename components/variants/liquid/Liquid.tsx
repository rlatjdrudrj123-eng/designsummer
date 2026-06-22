import styles from "./Liquid.module.css";
import Hero from "./Hero";
import About from "./About";
import Audience from "./Audience";
import DayBlock from "./DayBlock";
import Timetable from "./Timetable";
import Benefits from "./Benefits";
import Directions from "./Directions";
import Faq from "./Faq";
import Apply from "./Apply";
import Footer from "./Footer";
import ScrollCue from "./ScrollCue";

/* [LIQUID 변형] 글로시 액상(LIQUID) 필드 리스킨 클론.
   콘텐츠는 공식 컨퍼런스(@/lib/conference)로 전면 교체하고, 필수 섹션을 추가:
     HERO(배지·타이틀·부제·소개·일시·장소·일자별 사전등록 2버튼)
     → ABOUT(행사 개요·양일 트랙)
     → 추천 대상(Audience)
     → 라인업(연사 카드, DayBlock = CursorHeat + Lineup)
     → 상세 타임테이블(등록/휴식/세션 구분, 시간·스튜디오·연사·제목·설명)
     → 참가 혜택(Benefits)
     → 안내·오시는 길(Directions: 주최/정원/참가비/주소/주차 + 도면)
     → FAQ → 푸터.
   ★ 유지(LIQUID 아이덴티티):
     1) 글로시 액상 무지개 LUT(liquidLut.ts) + 시인/블룸 — HeatBlob / ConceptHeat /
        CursorHeat 효과와 커서 열원, 레이아웃·폰트.
     2) 화면 전체 옅은 광택 시트(.grain).
     3) CSS 열 액센트 토큰을 스펙트럼(핫 레드/주황/노랑)으로 스코프 오버라이드.
   ★ 제거: "the creative heatwave" / 열원·전사 등 클론에 하드코딩되어 있던 카피.

   self-contained: props 없음, 한 페이지 전체, 일반 흐름. <main> 래퍼는 호출부가 감싼다. */
export default function Liquid() {
  return (
    <div className={styles.root}>
      <Hero />
      <About />
      <Audience />
      <DayBlock day={1} />
      <DayBlock day={2} />
      <Timetable />
      <Benefits />
      <Directions />
      <Faq />
      <Apply />
      <Footer />
      <ScrollCue />
      <div className={styles.grain} aria-hidden="true" />
    </div>
  );
}
