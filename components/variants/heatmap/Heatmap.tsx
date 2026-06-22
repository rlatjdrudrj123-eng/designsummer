import styles from "./Heatmap.module.css";
import Hero from "./Hero";
import About from "./About";
import Audience from "./Audience";
import DayBlock from "./DayBlock";
import Timetable from "./Timetable";
import Benefits from "./Benefits";
import Directions from "./Directions";
import Faq from "./Faq";
import Footer from "./Footer";
import ScrollCue from "./ScrollCue";

/* [HEATMAP 변형] 진짜 JET 히트맵 리스킨 + 공식 컨퍼런스 콘텐츠(conference.ts) 클론.
   순서: HERO(배지·타이틀·서브·설명·일시·장소·일자별 사전등록 2개)
     → ABOUT(개요) → 추천 대상 → 라인업(DayBlock=챕터+연사) → 상세 타임테이블
     → 참가 혜택 → 안내·오시는 길 → FAQ → 푸터.
   ★ 아이덴티티 유지: 흰 베이스 위 jet-colormap 열 필드(LUT) + 커서 열(분석 히트맵 룩),
     레이아웃·폰트·열 액센트 토큰 스코프 오버라이드. + 옅은 그레인 오버레이.
   self-contained: props 없음, 한 페이지 전체. <main> 래퍼는 호출부가 감싼다. */
export default function Heatmap() {
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
      <Footer />
      <ScrollCue />
      <div className={styles.grain} aria-hidden="true" />
    </div>
  );
}
