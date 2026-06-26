/* ────────────────────────────────────────────────────────────────────────────
 * conference.ts — THE single unified content source for ALL /develop tabs.
 *
 * Every tab (1–11) renders THIS exact content; the tabs differ ONLY in layout /
 * design / composition / motion / form / UI / UX — never in content. This is the
 * final official Design Summer 2026 conference copy (provided by the client).
 *
 * Facts only. Short connective design copy in components is fine, but the copy
 * below is authoritative — do not invent stats or alter these facts.
 *
 * NOTE: 섹션별 사전등록은 K-PRINT 컨퍼런스 페이지로 링크아웃(클라이언트 제공 URL).
 * ──────────────────────────────────────────────────────────────────────────── */

const APPLY_SECTION_A = "https://kprint.kr/ko/conference/32"; // section A (08.20)
const APPLY_SECTION_B = "https://kprint.kr/ko/conference/30"; // section B (08.21)

export type TimetableRow = {
  time: string;
  /** studio / org (null for registration & breaks) */
  studio?: string | null;
  /** speaker name + title, e.g. "김기창 디자이너" */
  speaker?: string | null;
  /** session title (or the label for reg/break rows) */
  title: string;
  /** session description (sessions only) */
  desc?: string;
  /** "session" (default) | "reg" | "break" */
  kind?: "session" | "reg" | "break";
};

export const conference = {
  /* ── HERO ─────────────────────────────────────────────────────────────── */
  hero: {
    badge: "K-PRINT 2026 동시 개최 컨퍼런스",
    title: "Design Summer 2026",
    subtitle: "시각의 전환, 실무의 확장",
    desc: "디자인과 인쇄 산업의 접점에서 새로운 비즈니스 가능성을 탐구합니다.",
    note: "본 컨퍼런스는 Day 1 [디자인의 새로운 관점]과 Day 2 [디자인 실무의 확장]으로 나뉘어 진행되며, 각 트랙의 전문성을 높이기 위해 일자별 개별 등록으로 운영됩니다.",
    date: "08.20.목 - 08.21.금",
    venue: "KINTEX 제2전시장 3층 301호",
    /** two separate per-day registration buttons (rendered as distinct CTAs) */
    register: [
      { label: "section A 사전등록 (8.20 목)", day: 1, url: APPLY_SECTION_A },
      { label: "section B 사전등록 (8.21 금)", day: 2, url: APPLY_SECTION_B },
    ],
  },

  /* ── ABOUT (행사 개요) ─────────────────────────────────────────────────── */
  about: {
    intro:
      "막연한 트렌드 전망이 아닌, 업계 최전선에서 활동하는 디자이너의 시각으로 실무에 직접 적용할 수 있는 아이디어를 공유합니다. 이번 디자인 썸머 일산에서는 참관객의 실무 니즈에 맞추어 두 가지 핵심 테마로 세션을 분리 운영합니다.",
    days: [
      {
        day: 1,
        date: "aug 20, thu",
        title: "디자인의 새로운 관점",
        body: "기존의 작업 방식을 넘어, 실무에 즉시 적용 가능한 크리에이티브 접근법을 공유합니다.\n브랜딩 프로세스, 모션그래픽 디렉팅, AI 기술 도입 등 시각적 문법과 작업 환경의 변화를 짚어봅니다.",
      },
      {
        day: 2,
        date: "aug 21, fri",
        title: "디자인 실무의 확장",
        body: "디자인이 화면을 떠나 실제 비즈니스와 실물로 구현되는 과정을 공유합니다.\nB2C 브랜딩 전략, 비즈니스 입찰 논리, 박인쇄·후가공 등 현장에서 바로 쓰는 제작 실무를 짚어봅니다.",
      },
    ],
  },

  /* ── OVERVIEW (개요 — 메인 `/` Overview 섹션 전용: 슬로건·인트로·Day 요약·Information) ── */
  overview: {
    heading: "디자인 썸머 일산",
    slogan: "the creative heatwave",
    intro: [
      "모니터 안의 기획이 실제 결과물로 나오기까지, 디자인 실무는 수많은 변수와의 싸움입니다.",
      "올해 '디자인 썸머 일산'은 그 뜨거운 과정을 'the creative heatwave'라는 슬로건에 담았습니다.\n보기 좋은 결과물을 넘어, 디자인이 영감을 거쳐 비즈니스로 완성되기까지의 과정을 이틀에 걸쳐 다룹니다.",
      "결과를 통해 증명해 온 스페셜리스트 8인의 경험에서 창의적인 인사이트를 얻어가시기 바랍니다.",
    ],
    days: [
      {
        day: 1,
        date: "08.20. thu",
        label: "creative day",
        audience: "기획자, 브랜드 마케터, 영상/시각 디자이너",
        body: "브랜딩, 모션그래픽, AI 등 새로운 툴과 시각으로\n크리에이티브를 확장하는 기획과 방법론을 다룹니다.",
      },
      {
        day: 2,
        date: "08.21. fri",
        label: "craft day",
        audience: "편집/패키지 디자이너, 기업 대표·브랜드 매니저, 인쇄/제작 실무자",
        body: "비즈니스 논리, 후가공(박인쇄), 매체별 출력 편차 등\n실물 제작 단계에서 고려해야할 디테일을 짚어봅니다.",
      },
    ],
    closing:
      "현업에서 끊임없이 부딪히며 답을 찾아내고, 결과물을 증명해 온 스페셜리스트 8인의 경험에서 실질적인 인사이트를 얻어가시기 바랍니다.",
    info: [
      { label: "Host", value: "한국이앤엑스 K-PRINT 사무국" },
      { label: "Partner", value: "디자인하우스" },
      { label: "Date", value: "2026.08.20. 목 - 08.21. 금" },
      { label: "Venue", value: "KINTEX 제2전시장 3층" },
      { label: "Pass", value: "얼리버드 20,000원 (정상가 50,000원 · 1일권)" },
      { label: "Seats", value: "일 150명" },
    ],
  },

  /* ── TARGET AUDIENCE (추천 대상) ──────────────────────────────────────── */
  audience: {
    day1: {
      heading: "크리에이티브 & 워크플로우에 집중하는 분",
      /* "역할 : 설명" 형식(클라이언트 제공). 메인 Lineup 은 ' : ' 로 분리해 역할을
         소제목처럼 강조한다(다른 탐색 페이지는 문자열 그대로 사용 — 하위 호환).
         설명 내 \n 은 메인 Lineup 에서 줄바꿈으로 표시. */
      items: [
        "영상/시각 디자이너 : AI·모션그래픽 등 다양한 도구를\n실무에 직접 적용하려는 분",
        "브랜드 마케터 : 브랜드 에센스를 비주얼로 번역해\n시각화 과정을 체계화하려는 분",
        "기획자 : 변화하는 크리에이티브 문법을 이해하여\n실무 기획의 설득력을 높이고 싶은 분",
      ],
    },
    day2: {
      heading: "비즈니스 전략 & 하드웨어 구현에 집중하는 분",
      /* day1 과 동일한 "역할 : 설명" 형식. 메인 Lineup 은 ' : ' 분리 + \n 줄바꿈. */
      items: [
        "편집/패키지 디자이너 : 인쇄·후가공·지류 등 실물 마감으로\n브랜드 경험(BX)을 완성하려는 분",
        "기업 대표·브랜드 매니저 : 디자인을 취향이 아닌\n비즈니스 전략으로 다루고 싶은 분",
        "인쇄·제작 실무자 : 매체별 출력 편차를 줄이고\n상업적 완성도를 높이고 싶은 분",
      ],
    },
  },

  /* ── DETAILED TIMETABLE (상세 프로그램) ───────────────────────────────── */
  timetable: {
    day1: {
      day: 1,
      date: "8월 20일 (목)",
      title: "디자인의 새로운 관점",
      rows: [
        { time: "12:00 - 13:00", title: "registration", kind: "reg" },
        { time: "13:00 - 13:45", studio: "로호타입", speaker: "김기창 디자이너", title: "로호타입이 만난 인쇄 초심자들", desc: "인쇄 워크숍 현장에서 발생하는 빈번한 실수와 발견을 공유하고, 인쇄 프로세스를 이해하는 과정이 만드는 새로운 가능성을 짚어봅니다." },
        { time: "13:55 - 14:40", studio: "오디너리피플", speaker: "서정민 크리에이티브 디렉터", title: "브랜드를 만드는 세 가지 질문", desc: "정의에서 표현으로, 표현에서 접점으로 이어지는 브랜드 디자인 실무 프로세스와 아이덴티티 시각화 노하우를 다룹니다." },
        { time: "14:40 - 14:50", title: "Coffee Break (중간 휴식 · 10분)", kind: "break" },
        { time: "14:50 - 15:35", studio: "우트크리에이티브", speaker: "고성우 크리에이티브 디렉터", title: "필요 없는 건 다 끕니다: 예쁜 걸 넘어 설득이 되는 모션그래픽", desc: "불필요한 요소를 배제하고 본질만 남기는 디렉팅 기준과 화면 속 스틸컷이 실물 패키지로 연결된 프로젝트 사례를 소개합니다." },
        { time: "15:45 - 16:30", studio: "아카브릭", speaker: "조명훈 대표", title: "AI 시대, 디자이너는 무엇에 집중해야 하는가?", desc: "비주얼 AI 기술의 변화 속에서 디자이너가 주도권을 쥐고 자신의 역할을 재정의하기 위한 실무 준비사항을 제안합니다." },
      ] as TimetableRow[],
    },
    day2: {
      day: 2,
      date: "8월 21일 (금)",
      title: "디자인 실무의 확장",
      rows: [
        { time: "12:00 - 13:00", title: "registration", kind: "reg" },
        { time: "13:00 - 13:45", studio: "오세븐", speaker: "배수규 대표", title: "디자인은 취향이 아닌 비즈니스다", desc: "실제 경쟁 입찰 및 기업 프로젝트 사례 분석을 통해, 왜 특정 디자인이 최종안으로 선택될 수밖에 없었는지 그 비즈니스적 배경을 밝힙니다." },
        { time: "13:55 - 14:40", studio: "아우라지 디자인", speaker: "박진택 디렉터", title: "컨셉을 관통하는 창의적인 브랜드 비주얼", desc: "브랜드 에센스를 명확한 시각 컨셉과 키비주얼로 번역하고, 다양한 B2C 매체 전반으로 확장·적용하는 실무 프로세스입니다." },
        { time: "14:40 - 14:50", title: "Coffee Break (중간 휴식 · 10분)", kind: "break" },
        { time: "14:50 - 15:35", studio: "태창금박지", speaker: "이호준 대표", title: "디자인을 완성하는 박인쇄의 힘", desc: "단순한 가공을 넘어 브랜드의 컨셉과 감성을 선명하게 만드는 박인쇄(Foil Stamping)의 창의적 표현력과 하드웨어적 완성도를 분석합니다." },
        { time: "15:45 - 16:30", studio: "패터니스튜디오", speaker: "이요안나 대표", title: "패턴디자인 출력에서 고려해야 할 내용", desc: "지류, 원단, 상업 패키지 등 매체별 바탕지의 특성과 출력 설정값에 따른 결과물 편차를 예방하기 위한 사전 체크포인트를 다룹니다." },
      ] as TimetableRow[],
    },
  },

  /* ── SPECIAL EVENTS & BENEFITS (연계 이벤트 및 참가 혜택) ─────────────── */
  benefits: {
    groups: [
      {
        heading: "사전 등록 참여 이벤트",
        items: [
          {
            title: "연사 사전 질문 접수 (“무엇이든 물어보세요”)",
            body: "연사에게 궁금한 점을 남겨주세요. 각 세션 종료 후 Q&A 시간에 질문이 채택되신 분들께 소정의 기념품(디자인 서적 또는 커피 기프티콘)을 증정합니다.",
          },
        ],
      },
      {
        heading: "현장 참석자 전용 혜택",
        items: [
          { title: "K-PRINT 2026 프리미엄 실물 샘플킷 증정", body: "강연에서 다뤄지는 특수지, 박인쇄, 패턴 인쇄 기법이 적용된 한정판 실물 샘플 가이드를 일별 선착순 50명에게 제공합니다." },
          { title: "럭키드로우 (Lucky Draw)", body: "당일 전체 강연 종료 시점까지 자리를 지켜주신 참관객을 대상으로 추첨을 진행하여 고감도 디자인 굿즈를 선물합니다." },
          { title: "오픈 네트워킹", body: "행사 전후 강연자 및 업계 실무자들과 명함을 교환하고 자유롭게 소통할 수 있는 오픈 네트워킹 시간이 마련되어 있습니다." },
        ],
      },
    ],
    /* 메인 event 섹션 전용 — 3분할 카드(영문|국문 타이틀 + 설명 + 데이터포인트 +
       정방형 비주얼). 위 groups 는 탐색 페이지 하위호환용으로 유지.
       imageKey: content/images.json 에 업로드 시 해당 이미지로, 없으면 플레이스홀더. */
    events: [
      {
        title: "welcome goods",
        amount: "2만원 상당",
        body: "귀한 시간을 내어 참석해 주신 모든 분들께 감사의 마음을 담아 웰컴 패키지를 증정합니다.",
        imageKey: "event-welcome",
      },
      {
        title: "lucky draw",
        amount: "100만원 상당",
        body: "강연 종료 후 현장 추첨을 통해 참석자분들에게 프리미엄 경품을 제공합니다.",
        imageKey: "event-luckydraw",
      },
      {
        title: "K-PRINT invitation",
        amount: "2만원 상당",
        body: "최신 인쇄 산업 트렌드를 한눈에 확인할 수 있는 'K-PRINT 2026' 전시회 초대권 2매를 함께 제공합니다.",
        imageKey: "event-invitation",
      },
    ],
    /* 온도 테스트 — Benefits 직후 풀폭 띠 배너. url 은 테스트 페이지 준비 후 교체. */
    temperatureTest: {
      title: "나의 크리에이티브 온도 테스트",
      emoji: "🔥",
      body: "당신의 기획과 디자인 온도는 몇 도인가요? 간단한 테스트로 나의 작업 스타일을 확인하고 공유해 보세요. 참여자 중 추첨을 통해 한정판 굿즈 교환권을 드립니다.",
      cta: "테스트 시작하기",
      url: "#", // TODO: 온도 테스트 페이지 URL 로 교체
    },
  },

  /* ── INFORMATION & VENUE (안내 및 오시는 길) ─────────────────────────── */
  info: {
    host: "K-PRINT · 한국이앤엑스",
    capacity: "공간 제한으로 인해 일별 선착순 150명 사전등록 마감",
    price: "20,000원",
    address: "경기도 고양시 일산서구 킨텍스로 217-59, KINTEX 제2전시장 3층 301호",
    parking:
      "제2전시장 지하 주차장 이용 가능 (주차권은 별도로 지원되지 않으므로 가급적 대중교통 이용을 권장합니다.)",
  },

  /* ── 오시는 길 · 문의 (Aura 전용 / 메인 `/`) ──────────────────────────────
     건물·호수를 앞으로, 도로명은 별도 행. 대중교통/주차/문의를 정돈해 담는다.
     legacy info.address/parking 은 다른 페이지 호환용으로 유지. */
  directions: {
    place: "KINTEX 제2전시장 3층 301호",
    address: "경기도 고양시 일산서구 킨텍스로 217-59",
    mapLinks: [
      { label: "네이버 지도", url: "https://map.naver.com/p/search/킨텍스 제2전시장" },
      { label: "카카오맵", url: "https://map.kakao.com/?q=킨텍스 제2전시장" },
    ],
    navi: "‘킨텍스 제2전시장’ 또는 ‘킨텍스 제2전시장 주차장’",
    transit: [
      "GTX-A · 킨텍스역 하차 (서울역에서 약 16분)",
      "지하철 3호선 · 대화역 2번 출구",
    ],
    parking:
      "무료 주차권은 지원되지 않으며, 주차 요금은 킨텍스 규정에 따라 개별 정산됩니다. 행사 당일 혼잡이 예상되니 가급적 대중교통 이용을 권장합니다.",
    parkingLink: {
      label: "킨텍스 주차 안내",
      url: "https://www.kintex.com/web/ko/service/parking_user.do",
    },
    contact: {
      org: "K-PRINT 사무국",
      email: "kprint@kprint.kr",
      tel: "02-551-0102",
    },
  },

  /* ── FAQ ──────────────────────────────────────────────────────────────── */
  faq: [
    { q: "section A와 section B 양일 모두 참석하려면 어떻게 해야 하나요?", a: "section A와 section B는 별도의 등록 페이지로 운영됩니다. 양일 모두 참석을 원하시는 경우, 번거로우시더라도 각 일자별로 사전등록을 진행해 주시기 바랍니다." },
    { q: "특정 세션만 부분 등록하여 수강할 수 있나요?", a: "세션별 개별 등록은 불가하며, 일자별(section A, section B) 통합 등록으로 운영됩니다. 등록하신 일자에 한해 모든 세션을 자유롭게 수강하실 수 있습니다." },
    { q: "사전등록을 하지 못한 경우, 현장 등록도 가능한가요?", a: "본 행사는 원활한 운영을 위해 100% 사전등록제로 운영되며, 별도의 현장 등록 데스크는 상시 운영하지 않습니다. 단, 행사 당일 취소분(노쇼) 등 잔여 좌석이 발생할 경우에 한하여 매우 제한적으로 현장 접수가 진행될 수 있습니다." },
    { q: "세미나 참석 시 동시 개최되는 'K-PRINT 2026' 전시회도 관람할 수 있나요?", a: "본 세미나('디자인 썸머 일산')는 'K-PRINT 2026' 사전등록을 완료하신 분들에 한해 신청 가능하므로, 등록자 본인은 전시회를 무료로 관람하실 수 있습니다. 이에 더해 동반인과 함께 관람하실 수 있도록 'K-PRINT 2026' 무료 초대권 2매를 추가로 제공해 드립니다." },
    { q: "차량 이용 시 주차 요금 지원이 되나요?", a: "본 행사는 별도의 무료 주차권을 지원하지 않으며, 주차 요금은 킨텍스 규정에 따라 개별 정산해 주셔야 합니다. 상세한 주차 요금 및 할인 규정은 킨텍스 주차 안내 페이지에서 확인하실 수 있습니다. 행사 기간 내 전시장 주변이 매우 혼잡할 수 있으므로 가급적 대중교통 이용을 권장해 드립니다." },
    { q: "세미나 진행 중 외부로 나갔다가 재입장할 수 있나요?", a: "네, 가능합니다. 최초 입장 시 수령하신 출입증(네임택)을 패용하고 계시면 행사 시간 내 자유롭게 입퇴장이 가능합니다. 단, 강연이 진행 중일 경우 다른 참석자에게 방해가 되지 않도록 출입에 유의해 주시기 바랍니다." },
    { q: "무거운 짐이나 짐가방을 보관할 수 있는 곳이 있나요?", a: "세미나 전용 물품 보관소는 따로 운영되지 않습니다. 짐 보관이 필요하신 참관객께서는 킨텍스 전시장 로비에 비치된 유료 코인 락커를 개별적으로 이용해 주시기 바랍니다." },
    { q: "강연장 내에서 와이파이 및 노트북 전원(콘센트) 사용이 가능한가요?", a: "행사장 내 공용 와이파이가 제공되나, 동시 접속 인원이 많을 경우 통신 상태가 원활하지 않을 수 있습니다. 또한, 좌석에 따라 개별 전원 콘센트 지원이 불가하므로 노트북 등의 전자기기는 사전에 충분히 충전하여 방문해 주시기를 권장합니다." },
  ],
} as const;

export type Conference = typeof conference;
