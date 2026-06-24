import AuraSite from "@/components/aura/AuraSite";
import { conference } from "@/lib/conference";
import { speakers } from "@/lib/content";

/* 메인 `/` = 확정된 Aura 디자인(딜리버러블).
   실제 사이트 본문은 components/aura/ (AuraSite) + 콘텐츠(lib/conference, content/auraSpeakers.json, 업로드 이미지)에서 작업한다.
   /aura 는 동일 화면(작업/미리보기용) — 출시 전 정리.
   (이전 원본 SiteMain 은 /variants 의 "원본" 탭에 그대로 남아 있음.) */

/* 검색 리치결과(이벤트)용 schema.org Event JSON-LD.
   값은 모두 lib/conference.ts(라이브 본문 단일 소스)에서 가져온다(임의 생성 금지). */
const BASE_URL = "https://design-summer.kr";

/* 라이브 일정: Day 1 = 2026-08-20, Day 2 = 2026-08-21.
   행사 운영 13:00~17:00, 세션 13:00–16:30 (KST, +09:00). */
const DAY1_DATE = "2026-08-20";
const DAY2_DATE = "2026-08-21";
const SESSION_START = "13:00";
const SESSION_END = "16:30";

const day1 = conference.timetable.day1;
const day2 = conference.timetable.day2;
const register = conference.hero.register;
const APPLY_A = register.find((r) => r.day === 1)?.url ?? "https://kprint.kr/ko/conference/32";
const APPLY_B = register.find((r) => r.day === 2)?.url ?? "https://kprint.kr/ko/conference/30";

/* 가격: 얼리버드 20,000원 / 정상 50,000원 (1일권). 두 가격을 각각 Offer 로 표현. */
const offersFor = (url: string) => [
  {
    "@type": "Offer",
    name: "얼리버드 (1일권)",
    price: "20000",
    priceCurrency: "KRW",
    availability: "https://schema.org/InStock",
    url,
  },
  {
    "@type": "Offer",
    name: "정상가 (1일권)",
    price: "50000",
    priceCurrency: "KRW",
    availability: "https://schema.org/InStock",
    url,
  },
];

/* 장소 좌표 — KINTEX 제2전시장(한국국제전시장 2전시장).
   OpenStreetMap Nominatim 조회값(위 37.6647381 / 경 126.7418699)으로,
   Wikipedia KINTEX 좌표(37.66889 / 126.74556)와 근접해 교차검증됨. 추정 아님. */
const VENUE_LAT = 37.6647381;
const VENUE_LNG = 126.7418699;

const location = {
  "@type": "Place",
  name: conference.directions.place,
  address: {
    "@type": "PostalAddress",
    streetAddress: conference.directions.address,
    addressLocality: "고양시",
    addressRegion: "경기도",
    postalCode: "10390",
    addressCountry: "KR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: VENUE_LAT,
    longitude: VENUE_LNG,
  },
  /* 지도 링크 — 라이브 카피(conference.directions.mapLinks)의 네이버/카카오 지도. */
  hasMap: conference.directions.mapLinks.map((m) => m.url),
};

const organizer = {
  "@type": "Organization",
  name: conference.overview.info.find((i) => i.label === "Host")?.value ?? "한국이앤엑스 K-PRINT 사무국",
  url: "https://kprint.kr/",
};

/* 연사 8인 — Event.performer(Person)로 노출(이름 + 스튜디오/직함).
   값은 content/speakers.json(라이브 연사 단일 소스)에서 가져온다(임의 생성 금지).
   admin override(auraContent)는 화면 렌더에만 적용되고, 구조화데이터는 base 연사
   목록을 그대로 쓴다 — 사실(이름/스튜디오/직함)은 동일하다. */
const performers = speakers.map((s) => ({
  "@type": "Person",
  name: s.name,
  jobTitle: `${s.studio} ${s.role}`.trim(),
  ...(s.url && s.url.trim() ? { url: s.url.trim() } : {}),
}));

/* @type = EducationEvent — 본 행사는 8인 스페셜리스트의 강연/세미나(교육 목적)이므로
   Event 의 하위타입 EducationEvent 가 더 정확하다. EducationEvent 는 Event 의 모든
   속성을 상속하며 Google 이벤트 리치결과에서도 유효(여전히 표준 schema). */
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationEvent",
  name: `${conference.overview.heading} / ${conference.hero.title}`,
  alternateName: conference.overview.slogan, // "the creative heatwave"
  description: conference.hero.desc,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  startDate: `${DAY1_DATE}T${SESSION_START}:00+09:00`,
  endDate: `${DAY2_DATE}T${SESSION_END}:00+09:00`,
  url: `${BASE_URL}/`,
  image: [`${BASE_URL}/preview-v2.png`],
  inLanguage: "ko",
  location,
  organizer,
  performer: performers,
  offers: [...offersFor(APPLY_A), ...offersFor(APPLY_B)],
  subEvent: [
    {
      "@type": "EducationEvent",
      name: `section A — ${day1.title}`,
      description: conference.about.days[0].body.replace(/\n/g, " "),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      startDate: `${DAY1_DATE}T${SESSION_START}:00+09:00`,
      endDate: `${DAY1_DATE}T${SESSION_END}:00+09:00`,
      url: APPLY_A,
      location,
      organizer,
      offers: offersFor(APPLY_A),
    },
    {
      "@type": "EducationEvent",
      name: `section B — ${day2.title}`,
      description: conference.about.days[1].body.replace(/\n/g, " "),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      startDate: `${DAY2_DATE}T${SESSION_START}:00+09:00`,
      endDate: `${DAY2_DATE}T${SESSION_END}:00+09:00`,
      url: APPLY_B,
      location,
      organizer,
      offers: offersFor(APPLY_B),
    },
  ],
} as const;

/* FAQPage 구조화 데이터 — 검색결과의 FAQ 리치결과(아코디언) 표시용.
   값은 conference.faq(라이브 FAQ 단일 소스)에서 가져온다. 화면 FAQ(Faq.tsx)와 1:1 일치. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: conference.faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
} as const;

/* Organization 구조화 데이터 — 주최(한국이앤엑스 K-PRINT) 엔티티.
   브랜드 검색 시 지식패널·로고 인식 후보. 로고는 OG 미리보기를 임시 사용
   (정식 정사각 로고 자산 확보 시 교체 권장). */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: conference.info.host, // "K-PRINT · 한국이앤엑스"
  alternateName: "한국이앤엑스 K-PRINT 사무국",
  url: "https://kprint.kr/",
  logo: `${BASE_URL}/preview-v2.png`,
  email: conference.directions.contact.email,
  telephone: conference.directions.contact.tel,
  sameAs: ["https://kprint.kr/"],
} as const;

export default function Home() {
  return (
    <>
      {/* Event 구조화 데이터 — 검색 리치결과(일정/장소/가격/연사) 표시용 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      {/* FAQPage 구조화 데이터 — FAQ 리치결과용 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Organization 구조화 데이터 — 주최 엔티티 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <AuraSite />
    </>
  );
}
