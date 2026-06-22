import Hero from "./Hero";
import AboutSection from "./AboutSection";
import AudienceSection from "./AudienceSection";
import DayBlock from "./DayBlock";
import Timetable from "./Timetable";
import BenefitsSection from "./BenefitsSection";
import Directions from "./Directions";
import FaqSection from "./FaqSection";
import Apply from "./Apply";
import Footer from "./Footer";
import ScrollCue from "./ScrollCue";
import PostHeroRegion from "./PostHeroRegion";

/* 원본(메인) 사이트 본문 — 히어로 → D1/D2 챕터·라인업 → 타임테이블 → 오시는 길 → 신청 → 푸터.
   `/`(app/page.tsx)와 `/variants` 탭에서 공유한다. <main> 래퍼는 호출부가 감싼다.

   히어로 아래 전 구간은 Aura 시안처럼 하나의 연속된 따뜻한 오라 그라운드 위에 얹힌다:
   <Hero/> 는 그대로 두고, 그 아래 모든 섹션(D1/D2 챕터·라인업, 타임테이블, 오시는 길,
   신청, 푸터)을 PostHeroRegion 으로 감싸 단일 PostHeroAura 필드를 깔고, 섹션들은
   투명 배경으로 그 위에 떠 있게 한다.

   aura prop: 기본 true 면 위처럼 오라 필드를 깐다. false 면 PostHeroRegion 이
   PostHeroAura 캔버스/풀블리드 컬러 레이어를 렌더하지 않고, 섹션들이 평범한 흰
   페이지 배경 위에 얹힌다 (히어로는 두 버전 모두 동일). 따뜻한 --mood 톤 시프트
   (스튜디오명·악센트)는 그대로 유지된다 — 빼는 건 오라 "필드" 뿐. */
/* lang (default "ko"): "en" renders the English-title variant — Saira Condensed
   display face (free substitute for Franklin Gothic Cond), fixed English headline
   strings, romanized speaker names + English role descriptors, English venue, and
   English dates. Session-title/credential COPY is NOT translated (project copy rule);
   it stays as-is from the data. All hero/scene visuals + interactions are unchanged. */
export default function DevelopSite({
  aura = true,
  lang = "ko",
}: {
  aura?: boolean;
  lang?: "ko" | "en";
}) {
  return (
    <>
      <Hero lang={lang} />
      <PostHeroRegion aura={aura}>
        <AboutSection />
        <AudienceSection />
        <DayBlock day={1} lang={lang} />
        <DayBlock day={2} lang={lang} />
        <Timetable />
        <BenefitsSection />
        <Directions lang={lang} />
        <FaqSection />
        <Apply />
        <Footer />
      </PostHeroRegion>
      <ScrollCue />
    </>
  );
}
