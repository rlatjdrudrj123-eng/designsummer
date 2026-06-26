/* ============================================================================
 * 디자이너 동물상 × 크리에이티브 온도 — 데이터 + 결정론 스코어링
 * 단일 소스: docs/viral-test-spec.md + docs/viral-test-questions-bank.md.
 * 런타임 AI 없음. 선택지 점수 합 → 최고점 동물. 백조는 히든 트리거.
 * ※ 선별 10문항(5단계 서사). 답변 매핑 조정으로 9종 4~5회 균등. 점수 +2.
 * ========================================================================== */

export type AnimalId =
  | "alpaca"
  | "sloth"
  | "owl"
  | "cat"
  | "dog"
  | "chameleon"
  | "otter"
  | "fox"
  | "tiger"
  | "swan";

/** 점수 집계 대상이 되는 메인 9종 (백조 제외). */
export type ScoredAnimalId = Exclude<AnimalId, "swan">;

/* ── 행사 섹션(사전등록 링크아웃) ─────────────────────────────────────────
   각 동물은 자신의 '추천 섹션'(section)을 가진다 — 그 동물의 결핍을 채워줄 곳.
   결과 CTA는 이 추천 섹션으로 바로 보낸다("부족한 1%"를 채우는 컨셉).
   백조도 section 을 가져 동일 패턴. */
export const SECTIONS = {
  A: {
    key: "section A",
    title: "디자인의 새로운 관점",
    date: "8.20 목",
    url: "https://kprint.kr/ko/conference/32?utm_source=mainbutton&utm_medium=button&utm_campaign=4aesn8_46198_general",
  },
  B: {
    key: "section B",
    title: "디자인 실무의 확장",
    date: "8.21 금",
    url: "https://kprint.kr/ko/conference/30?utm_source=mainbutton&utm_medium=button&utm_campaign=4qh8fo_46198_general",
  },
} as const;

export type SectionKey = keyof typeof SECTIONS;

export interface Animal {
  id: AnimalId;
  emoji: string;
  /** 온도(오름차순 = tieOrder). 동점 시 작은 값(차가운 쪽) 우선. */
  temp: number;
  /** 온도 표시 라벨(36.5 같은 소수 보존용). */
  tempLabel: string;
  tieOrder: number;
  name: string; // 유형명
  oneLiner: string; // 한 줄 평 (카드 大)
  desc: string; // 성격 설명
  good?: { animal: string; emoji: string; why: string }; // 굿 궁합
  worst?: { animal: string; emoji: string; why: string }; // 워스트 궁합
  /** 이 동물의 '추천' 행사 섹션(A/B) — 결핍을 채워줄 곳. 결과 CTA가 향하는 섹션. */
  section: SectionKey;
  /** 결핍 보완 한 문단 — "부족한 1%"(추천 섹션으로 보내는 이유). */
  gap: string;
}

/** 메인 9종 — 온도 오름차순(= tieOrder). */
export const ANIMALS: Record<ScoredAnimalId, Animal> = {
  alpaca: {
    id: "alpaca",
    emoji: "🦙",
    temp: 25,
    tempLabel: "25",
    tieOrder: 1,
    name: "남들 모르는 게 좋은 힙스터 알파카",
    oneLiner: "그거 유행하기 전부터 썼는데요?",
    desc: "인기 있는 건 일부러 안 함. 아무도 모르는 인디 폰트·리소 인쇄·언더그라운드 스튜디오 디깅이 취미. 트렌드 따라가는 거 질색하고 시크한 척하지만, 본인이 판 게 6개월 뒤 유행함. 차갑게 식은 척이 디폴트.",
    good: { animal: "부엉이", emoji: "🦉", why: "둘 다 남 신경 끄고 마이웨이라 안 부딪힘" },
    worst: { animal: "카멜레온", emoji: "🦎", why: "유행 vs 마이너, 취향이 정반대" },
    section: "B",
    gap: "취향만 좇다간 비즈니스를 놓칩니다. 당신의 마니악한 감각을 상업적 결과물로 설득해 낼 '실전 비즈니스 논리'가 시급합니다.",
  },
  sloth: {
    id: "sloth",
    emoji: "🦥",
    temp: 36.5,
    tempLabel: "36.5",
    tieOrder: 2,
    name: "미지근하게 완벽한 나무늘보",
    oneLiner: "급할 거 없어, 어차피 내가 맞으니까",
    desc: "절대 서두르지 않는데 결과물은 늘 깔끔함. 1px 어긋난 거 며칠 뒤에도 기억함. 느린 게 아니라 신중한 거라고 우김. 딱 체온만큼만 미지근하게.",
    good: { animal: "고양이", emoji: "🐈", why: "서로 안 닦달하는 느긋 콤비" },
    worst: { animal: "여우", emoji: "🦊", why: "마감 속도가 극과 극" },
    section: "A",
    gap: "1px 디테일에 갇혀 디자인의 확장을 놓치고 있진 않나요? AI와 새로운 툴을 도입해 작업의 판을 키울 때입니다.",
  },
  owl: {
    id: "owl",
    emoji: "🦉",
    temp: 45,
    tempLabel: "45",
    tieOrder: 3,
    name: "헤드셋 낀 은둔형 부엉이",
    oneLiner: "아무도 말 안 걸 때 진짜 실력이 나옴",
    desc: "슬랙 알림·북적이는 환경엔 기빨림. 노이즈 캔슬링 끼고 세상과 단절돼야 비로소 각성함. 요란하게 안 뒤지고 조용히 관찰하다 군더더기 없는 통찰 한 방으로 끝냄. 은은하게 데워지는 타입.",
    good: { animal: "알파카", emoji: "🦙", why: "조용히 각자 파는 게 편한 사이" },
    worst: { animal: "강아지", emoji: "🐕", why: "시끌벅적 텐션에 기 빨림" },
    section: "B",
    gap: "모니터 뒤에 숨어 만족하는 건 여기까지. 실물 제작 현장에서 마주할 수많은 변수를 미리 통제하는 실무 지식을 챙기세요.",
  },
  cat: {
    id: "cat",
    emoji: "🐈",
    temp: 50,
    tempLabel: "50",
    tieOrder: 4,
    name: "내키면 천재 고양이",
    oneLiner: "기분 좋으면 명작, 아니면 잠수",
    desc: "컨디션과 '삘'이 곧 퀄리티. 꽂히면 밤새 갈아넣고, 안 꽂히면 커서만 깜빡임. 피드백은 들었지만 안 들은 척도 가능. 기분 따라 온도 들쭉날쭉.",
    good: { animal: "나무늘보", emoji: "🦥", why: "기분 존중해주는 느긋한 짝" },
    worst: { animal: "수달", emoji: "🦦", why: "삘 vs 시스템, 영 안 맞음" },
    section: "A",
    gap: "'삘'이 안 오면 멈추는 작업은 한계가 명확하죠. 감각을 흔들리지 않는 체계적인 브랜딩 프로세스로 정립해 보세요.",
  },
  dog: {
    id: "dog",
    emoji: "🐕",
    temp: 68,
    tempLabel: "68",
    tieOrder: 5,
    name: "다 좋다는 골든리트리버",
    oneLiner: "오 좋은데요? 이것도 좋고 저것도 좋고",
    desc: "텐션 담당. 레퍼런스 100개 긁어오고 다 좋다고 함. 분위기 메이커지만 시안 3개 중 못 고름. 늘 한결같이 따뜻한 텐션.",
    good: { animal: "카멜레온", emoji: "🦎", why: "같이 신나서 레퍼 흡수하는 사이" },
    worst: { animal: "호랑이", emoji: "🐯", why: "주도권에 자꾸 치임" },
    section: "B",
    gap: "다 좋다는 건 기준이 없다는 뜻이죠. '취향'이 아닌 '비즈니스 전략'으로 단 하나의 디자인을 결단하는 법을 배워보세요.",
  },
  chameleon: {
    id: "chameleon",
    emoji: "🦎",
    temp: 75,
    tempLabel: "75",
    tieOrder: 6,
    name: "트렌드에 몸을 맡긴 카멜레온",
    oneLiner: "요즘 유행하는 그 느낌, 바로 가능합니다",
    desc: "핀터레스트·비핸스를 스펀지처럼 흡수. 본인 고집보다 요즘 제일 힙한 스타일을 기가 막히게 뽑아내는 트렌드 헌터. 톤앤매너 자유자재. 항상 제일 핫한 쪽.",
    good: { animal: "강아지", emoji: "🐕", why: "둘 다 흡수형이라 합이 좋음" },
    worst: { animal: "알파카", emoji: "🦙", why: "마이너 고집이랑 충돌" },
    section: "B",
    gap: "화면 속 화려한 유행도 실물 앞에선 무너집니다. 트렌디한 시안을 묵직한 실물(인쇄/후가공)로 완벽하게 안착시키세요.",
  },
  otter: {
    id: "otter",
    emoji: "🦦",
    temp: 87,
    tempLabel: "87",
    tieOrder: 7,
    name: "장비충 수달",
    oneLiner: "세팅 끝나면 효율은 제가 1등",
    desc: "단축키·플러그인·툴 세팅이 완벽해야 비로소 작업 시작. 폴더 구조·네이밍 장인. 손은 느려 보여도 세팅만 끝나면 미친 효율. 준비되면 후끈 풀가동.",
    good: { animal: "호랑이", emoji: "🐯", why: "세팅 + 추진력 환상 콤비" },
    worst: { animal: "고양이", emoji: "🐈", why: "변덕이 시스템을 흔듦" },
    section: "A",
    gap: "기능적 세팅은 이미 만렙! 이제 기술적 능숙함을 넘어, 크리에이티브를 단단하게 지탱할 기획력과 브랜드 시각을 채울 차례입니다.",
  },
  fox: {
    id: "fox",
    emoji: "🦊",
    temp: 100,
    tempLabel: "100",
    tieOrder: 8,
    name: "마감 직전 폭주하는 여우",
    oneLiner: "마감이 곧 영감입니다",
    desc: "평소엔 잠잠하다 데드라인 임박하면 각성. 12시간 만에 시안 5개 뽑는 미친 화력. 여유는 없지만 결과는 나옴. 마감 앞에선 펄펄 끓음.",
    good: { animal: "호랑이", emoji: "🐯", why: "불 붙으면 같이 폭주하는 화력 콤비" },
    worst: { animal: "나무늘보", emoji: "🦥", why: "느긋함에 복장 터짐" },
    section: "B",
    gap: "마감 벼락치기로 화면은 끝냈어도 인쇄 사고는 못 막습니다. 제작 현장의 아찔한 변수들을 미리 대비하는 눈을 가지세요.",
  },
  tiger: {
    id: "tiger",
    emoji: "🐯",
    temp: 120,
    tempLabel: "120",
    tieOrder: 9,
    name: "디렉팅 욕심 호랑이",
    oneLiner: "그건 제가 한번 보고 정할게요",
    desc: "손도 빠르고 입도 빠름. 디테일 집착 + 전체 그림 둘 다 챙기는 리더형. 다만 남 시안에 손이 먼저 나감. 늘 과열 직전, 풀파워.",
    good: { animal: "여우", emoji: "🦊", why: "둘 다 화력 만렙, 죽이 잘 맞음" },
    worst: { animal: "강아지", emoji: "🐕", why: "결정 못 하는 게 답답함" },
    section: "A",
    gap: "모든 걸 직접 해야 직성이 풀리면 결국 방전됩니다. 새로운 AI 툴과 작업 문법을 도입해 팀의 생산성을 영리하게 높여보세요.",
  },
};

/** 히든 — 백조. 점수 분산이 고를 때 등장. */
export const SWAN: Animal = {
  id: "swan",
  emoji: "🦢",
  temp: 60,
  tempLabel: "60",
  tieOrder: 0,
  name: "수면 아래서 발버둥 치는 백조",
  oneLiner: "겉은 여유, 속은 제발 오류만 나지 마라",
  desc: "겉보기엔 우아하게 일정 맞춰 끝내는 사람. 사실 화면 뒤에선 퀄리티 맞추느라 픽셀이랑 사투 중. 겉은 미지근, 속은 펄펄. 모든 디자이너 안에 한 마리쯤 숨어 있다.",
  // 추천: section A — 혼자 사투하는 픽셀질을 실무 접근법으로 풀어줄 곳.
  section: "A",
  gap: "혼자 픽셀과 사투하는 물갈퀴질은 이제 그만! 실무에 즉시 적용 가능한 크리에이티브 접근법으로 작업의 여유를 되찾으세요.",
};

/* ── 섹션 카피 ────────────────────────────────────────────────────────────
   사이트 보이스(차분·실무·따뜻함)에 맞춘 짧은 연결 카피. 동물 캐릭터 카피는
   위트를 유지하되, 섹션 진입/안내 문구는 과한 마케팅·번역체를 피한다. */
export const TEST_COPY = {
  /** 영문 소문자 아이브로우 — 다른 섹션(contact & location 등)과 동일 톤. */
  eyebrow: "creative thermometer",
  /** 한글 헤딩 — 옴니고딕 디스플레이. */
  title: "디자이너 동물상",
  /** 헤딩 옆 보조 문구(좌측, 한 줄). */
  lead: "질문에 답하면 나의 작업 온도와 동물상이 나옵니다.",
  start: "시작하기",
  /** 리빌(열구) 안내. */
  revealLead: "측정 거의 끝. 결과가 이 안에 있어요.",
  revealAction: "톡톡 두드려 꺼내보세요",
  /** "부족한 1%" 블록 — 결과의 핵심 전환. 결핍 문구(animal.gap) + 추천 섹션 신청. */
  gapTitle: "당신에게 필요한 부족한 1%",
  gapCta: "신청하기",
  /** 결과 액션 버튼. */
  shareCta: "결과 공유하기",
  again: "다시 하기",
  /** /r 재진입(공유받은 사람 → 홈 테스트). */
  retryCta: "나도 측정하기",
  /** 클립보드 복사 토스트. */
  toast: "링크를 복사했습니다.",
} as const;

export interface Choice {
  label: string;
  animal: ScoredAnimalId;
  points: number;
}

export interface Question {
  q: string;
  choices: Choice[];
}

/* 뱅크 기반 K-PRINT 참관객(인쇄·출판 실무자) 공감 10문항 — 4파트 구성.
   답변 동물 매핑을 밸런스 검수로 조정해 9종이 4~5회로 균등하게 등장한다:
   수달·알파카·나무늘보·고양이5 / 카멜레온·부엉이·호랑이·강아지·여우4. 점수 +2 균등.
   (인쇄 고증 카피 유지, 선택지 4개만 동물 재배치: Q3②·Q4①·Q5③·Q8①) */
export const QUESTIONS: Question[] = [
  // ── Part 1. 작업의 시작과 파일 상태 ──
  {
    q: "새로운 프로젝트 킥오프! 자리에 돌아와 제일 먼저 하는 건?",
    choices: [
      { label: "단축키, 플러그인, 워크스페이스 세팅부터. 장비와 환경이 8할", animal: "otter", points: 3 },
      { label: "핀터레스트, 비핸스 무한 스크롤하며 요즘 제일 잘 나가는 레퍼런스 수집", animal: "chameleon", points: 2 },
      { label: "남들 다 아는 건 싫음. 해외 인디 폰트/아카이브 사이트 순례", animal: "alpaca", points: 2 },
      { label: "멍때리는 거 아님. 의자 젖히고 천장 보며 머릿속으로 시뮬레이션 중", animal: "owl", points: 2 },
    ],
  },
  {
    q: "동료 작업 파일을 넘겨받았다. 레이어 이름이 죄다 'Rectangle 12', 'Group 5'…",
    choices: [
      { label: "(한숨) 네이밍 컨벤션 발동. 폴더·레이어 정리부터 싹 새로 함", animal: "otter", points: 2 },
      { label: "내 눈으로 확인해야 직성이 풀림. 눈알 켜고 끄며 1개씩 다 이름 붙임", animal: "sloth", points: 2 },
      { label: '"결과물만 잘 나오면 그만" 쿨하게 무시하고 내 갈 길 감', animal: "cat", points: 2 },
      { label: '"저기요… 이건 협업 매너가 아니지 않나요?" 조용히 짚고 넘어감', animal: "tiger", points: 2 },
    ],
  },
  // ── Part 2. 클라이언트 & 피드백 잔혹사 ──
  {
    q: '클라이언트: "미니멀한 건 좋은데, 로고 3배 키우고 빈 공간에 글자 꽉 채워주세요."',
    choices: [
      { label: '"여백도 디자인의 일부입니다" 피 토하며 미니멀리즘 사수', animal: "alpaca", points: 3 },
      { label: '"요즘 Y2K 맥시멀이 트렌드긴 하죠" 유행인 척 매끄럽게 받아침', animal: "chameleon", points: 2 },
      { label: '"넵! 시원~하게 키워볼게요!" 일단 밝게 수용하고 본다', animal: "dog", points: 2 },
      { label: '"넵… (영혼 가출)" 하고 적당히 눈치껏 타협해서 넘김', animal: "cat", points: 2 },
    ],
  },
  {
    q: '형용사 지옥 피드백: "감각적이고 고급진데, 눈에 확 띄면서도 너무 튀진 않게 해주세요."',
    choices: [
      { label: '"아~ 그 무드 정확히 알죠" 요즘 핫한 레퍼런스 가져와서 시각화해 줌', animal: "chameleon", points: 3 },
      { label: '"말씀하신 요구사항 중 우선순위 1위가 뭔가요?" 논리적으로 쪼개서 질문', animal: "tiger", points: 2 },
      { label: "멘탈 일시 정지… 일단 내 직감이 이끄는 대로 손 가는 대로 그려봄", animal: "cat", points: 2 },
      { label: '"넵! 다~ 반영해서 기가 막히게 뽑아볼게요" (어떻게든 되겠지)', animal: "dog", points: 2 },
    ],
  },
  {
    q: "클라이언트가 하필 내가 버리려던 'B안(버리는 안)'을 골랐다.",
    choices: [
      { label: "'그거… 30분 만에 한 건데…' 속으로 쾌재 부르며 조기 퇴근", animal: "alpaca", points: 2 },
      { label: '"1안이 기획 의도에 왜 더 부합하는지" PPT 켜서 다시 설득 모드', animal: "tiger", points: 3 },
      { label: '"오! 그 포인트를 좋게 봐주셨네요!" 신나서 B안 폭풍 디벨롭', animal: "dog", points: 2 },
      { label: '"선택 존중합니다." 그 안의 허접한 디테일을 묵묵히 다시 깎음', animal: "sloth", points: 2 },
    ],
  },
  // ── Part 3. 마감과 워크플로우 ──
  {
    q: '"이거 금방 되죠? 누끼 따고 텍스트만 얹으면 5분 컷이잖아~"',
    choices: [
      { label: '"네 금방 해드릴게요!" 해놓고 결국 마감 직전 몰아쳐 한 방에 끝냄', animal: "fox", points: 3 },
      { label: '"그 5분을 위해 액션/템플릿 다 세팅해 뒀죠" 진짜 5분 컷 증명', animal: "otter", points: 2 },
      { label: '"제대로 인쇄 넘기려면 시간 걸려요. 5분은 무리입니다" 타협 불가', animal: "sloth", points: 2 },
      { label: "'지가 해보든가' 속으로 일정표 다시 짜며 분노 게이지 상승", animal: "tiger", points: 2 },
    ],
  },
  {
    q: "마감 D-3. 솔직하게 까보는 나의 현재 진행률은?",
    choices: [
      { label: "0%. 하지만 마지막 날 풀파워로 기적처럼 끝냄. 마감이 내 영감", animal: "fox", points: 2 },
      { label: "이미 큰 틀은 끝냄. 지금은 1px 자간·행간·곡률 만지는 중", animal: "sloth", points: 2 },
      { label: "30%. 아직 발동 안 걸림. 삘만 오면 하룻밤에 순삭 가능", animal: "cat", points: 3 },
      { label: "노캔 이어폰 끼고 잠수. 남들은 모르게 속으로 80% 완성 상태", animal: "owl", points: 2 },
    ],
  },
  {
    q: "폭풍 마감 오후 3시. 나에게 가장 필요한 '부스터'는?",
    choices: [
      { label: "아무도 안 듣는 나만의 인디 플레이리스트 (에센셜 플레이리스트 금지)", animal: "alpaca", points: 2 },
      { label: "슬랙, 카톡 다 끄고 세상과 단절. 100% 밀도 높은 집중 모드", animal: "owl", points: 3 },
      { label: "긴장감 쫙 끌어올려 주는 모니터 구석의 카운트다운 타이머", animal: "fox", points: 2 },
      { label: '동료들과 "가보자고!" 외치며 커피/당 충전, 억텐 끌어올리기', animal: "dog", points: 3 },
    ],
  },
  // ── Part 4. 인쇄와 실무의 현장 (K-PRINT 맞춤) ──
  {
    q: "모니터에서 쨍하던 형광 그린이 인쇄물(CMYK)로 나오니 칙칙해졌다. 나의 반응은?",
    choices: [
      { label: "별색(PANTONE) 넘버 찾고, CMYK 배합 수치 다시 계산해 재교정", animal: "otter", points: 2 },
      { label: "내가 원하는 그 색감이 정확히 안착할 때까지 감리 보면서 기장님 괴롭힘", animal: "sloth", points: 3 },
      { label: '"마감 급한데 이 정도면 선방했죠. 그냥 이대로 밀어주세요"', animal: "fox", points: 2 },
      { label: '"오히려 이 묵직하고 탁한 톤이 더 빈티지하고 힙한데?" 기적의 정신승리', animal: "cat", points: 2 },
    ],
  },
  {
    q: '"요즘은 그거 다 AI로 뚝딱 만들던데요?"라는 말을 들었을 때',
    choices: [
      { label: '"안 쓰면 손해죠" 미드저니부터 챗GPT까지 프롬프트 깎는 AI 활용파', animal: "chameleon", points: 2 },
      { label: '"디자인은 손맛과 오리지널리티가 본질" 꿋꿋한 전통 작업 사수파', animal: "alpaca", points: 2 },
      { label: "이미 내 워크플로우에 AI 확장·자동화 세팅 완비. 효율 최고", animal: "otter", points: 2 },
      { label: "조용히 소스용으로 잘 쓰고 있지만, 굳이 남에게 말 안 함", animal: "owl", points: 2 },
    ],
  },
];

const SCORED_IDS: ScoredAnimalId[] = [
  "alpaca",
  "sloth",
  "owl",
  "cat",
  "dog",
  "chameleon",
  "otter",
  "fox",
  "tiger",
];

/**
 * 결정론 집계.
 * - answers[i] = 질문 i 에서 고른 선택지 인덱스(미응답이면 -1/undefined 무시).
 * - 점수 내림차순, 동점이면 tieOrder 오름차순(온도 낮은 동물 우선).
 * - 백조 히든: (1위-2위) <= 1 && 1점 이상 득점 동물 >= 6 → swan.
 */
export function scoreTest(answers: number[]): Animal {
  const scores: Record<ScoredAnimalId, number> = {
    alpaca: 0,
    sloth: 0,
    owl: 0,
    cat: 0,
    dog: 0,
    chameleon: 0,
    otter: 0,
    fox: 0,
    tiger: 0,
  };

  QUESTIONS.forEach((question, qi) => {
    const choiceIndex = answers[qi];
    if (choiceIndex === undefined || choiceIndex < 0) return;
    const choice = question.choices[choiceIndex];
    if (!choice) return;
    scores[choice.animal] += choice.points;
  });

  const sorted = [...SCORED_IDS].sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    // 동점이면 '뜨거운(온도 높은)' 동물 우선 — 차가운 쪽 우선이면 여우·호랑이가
    // 계속 동점에서 밀려 안 나오는 문제(플레이테스트 검증)를 바로잡는다.
    return ANIMALS[b].tieOrder - ANIMALS[a].tieOrder;
  });

  const top = sorted[0];
  const second = sorted[1];
  const scoredCount = SCORED_IDS.filter((id) => scores[id] >= 1).length;

  // 백조: 1·2위가 '정확히' 동점일 때만(시그니처 +1 가중치로 1점 차이는 진짜 차이).
  if (second && scores[top] - scores[second] === 0 && scoredCount >= 6) {
    return SWAN;
  }
  return ANIMALS[top];
}
