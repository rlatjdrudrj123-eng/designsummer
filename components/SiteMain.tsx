import Hero from "@/components/sections/Hero";
import DayBlock from "@/components/sections/DayBlock";
import Timetable from "@/components/sections/Timetable";
import Directions from "@/components/sections/Directions";
import Apply from "@/components/sections/Apply";
import Footer from "@/components/sections/Footer";
import ScrollCue from "@/components/scroll/ScrollCue";

/* 원본(메인) 사이트 본문 — 히어로 → D1/D2 챕터·라인업 → 타임테이블 → 오시는 길 → 신청 → 푸터.
   `/`(app/page.tsx)와 `/variants` 탭에서 공유한다. <main> 래퍼는 호출부가 감싼다. */
export default function SiteMain() {
  return (
    <>
      <Hero />
      <DayBlock day={1} />
      <DayBlock day={2} />
      <Timetable />
      <Directions />
      <Apply />
      <Footer />
      <ScrollCue />
    </>
  );
}
