/* ============================================================================
 * 디자이너 동물상 × 크리에이티브 온도 — 데이터 + 결정론 스코어링
 * 단일 소스: docs/viral-test-spec.md + docs/viral-test-questions-bank.md.
 * 런타임 AI 없음. 선택지 점수 합 → 최고점 동물. 백조는 히든 트리거.
 * ※ 현재 질문은 뱅크 17문항 전부(트림 전). 점수는 임시 +2 균등(밸런스 검수 전).
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
   각 동물은 자신의 '강점 섹션'(section)을 가진다. 결과 CTA는 강점이 아니라
   그 반대 섹션(opposite)으로 보낸다 — "이미 잘하는 곳"이 아니라 "아직 안 해본
   영역으로 한 뼘 더 확장"하는 성장 컨셉. 백조도 section 을 가져 동일 패턴. */
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

/** 강점 섹션의 '반대' 섹션 — 결과 CTA는 이 반대 섹션을 추천(빈 곳 채우기). */
export function oppositeSection(section: SectionKey): SectionKey {
  return section === "A" ? "B" : "A";
}

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
  /** 이 동물의 '강점' 행사 섹션(A/B). 결과 CTA는 oppositeSection 으로 보낸다. */
  section: SectionKey;
}

/** 메인 9종 — 온도 오름차순(= tieOrder). */
export const ANIMALS: Record<ScoredAnimalId, Animal> = {
  alpaca: {
    id: "alpaca",
    emoji: "🦙",
    temp: 25,
    tempLabel: "25",
    tieOrder: 1,
    name: "남들 모르는 게 좋은 알파카",
    oneLiner: "그거 뜨기 전부터 썼는데요",
    desc: "인기 있는 건 일부러 안 함. 아무도 모르는 인디 폰트·리소 인쇄·언더그라운드 스튜디오 디깅이 취미. 트렌드 따라가는 거 질색하고 시크한 척. 근데 본인이 판 게 6개월 뒤 유행함. 차갑게 식은 척이 디폴트.",
    good: { animal: "부엉이", emoji: "🦉", why: "둘 다 남 신경 끄고 마이웨이라 안 부딪힘" },
    worst: { animal: "카멜레온", emoji: "🦎", why: "유행 vs 마이너, 취향이 정반대" },
    section: "A",
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
    section: "B",
  },
  owl: {
    id: "owl",
    emoji: "🦉",
    temp: 45,
    tempLabel: "45",
    tieOrder: 3,
    name: "헤드셋 낀 은둔형 부엉이",
    oneLiner: "아무도 말 안 걸 때 진짜 실력이 나옴",
    desc: "슬랙 알림·북적이는 환경엔 기빨림. 노이즈 캔슬링 끼고 세상과 단절돼야 비로소 각성. 요란하게 안 뒤지고 조용히 관찰하다 군더더기 없는 통찰 한 방으로 끝냄. 은은하게 데워지는 타입.",
    good: { animal: "알파카", emoji: "🦙", why: "조용히 각자 파는 게 편한 사이" },
    worst: { animal: "강아지", emoji: "🐕", why: "시끌벅적 텐션에 기 빨림" },
    section: "A",
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
    section: "A",
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
    section: "A",
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
    section: "B",
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
    section: "B",
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
  desc: "겉보기엔 우아하게 일정 맞춰 끝내는 사람. 사실 화면 뒤에선 퀄 맞추느라 픽셀이랑 사투 중. 겉은 미지근, 속은 펄펄. 모든 디자이너 안에 한 마리쯤 숨어 있다.",
  // 강점 A → 반대인 section B 를 추천(다른 동물과 동일 패턴).
  section: "A",
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
  /** 세션 CTA — 결과의 핵심 전환. 강점의 '반대' 섹션으로 보낸다(빈 곳 채우기).
      '부족' 같은 부정어 없이 성장·확장 톤. */
  speakerCta: "나를 채워줄 섹션",
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

/* 뱅크(docs/viral-test-questions-bank.md) 17문항 전부 — 트림 전.
   각 선택지는 뱅크의 이모지 태그 동물에 +2(임시 균등). 밸런스는 검수에서. */
export const QUESTIONS: Question[] = [
  {
    q: "프로젝트 킥오프! 자리에 돌아와 제일 먼저 하는 건?",
    choices: [
      { label: "단축키·플러그인·그리드부터 세팅. 장비가 8할", animal: "otter", points: 2 },
      { label: '핀터레스트 "2026 트렌드" 무한 스크롤', animal: "chameleon", points: 2 },
      { label: "남들 모르는 해외 레퍼 사이트부터 순례", animal: "alpaca", points: 2 },
      { label: "의자 젖히고 천장 보며 머릿속에서 다 지어봄", animal: "owl", points: 2 },
    ],
  },
  {
    q: "동료 피그마 파일을 열었다. 레이어 이름이 죄다 'Rectangle 12'.",
    choices: [
      { label: "네이밍 컨벤션 발동. 폴더부터 싹 정리", animal: "otter", points: 2 },
      { label: "1개씩 다 이름 붙여야 직성 풀림 (손 떨림)", animal: "sloth", points: 2 },
      { label: '"돌아가면 됐지" 쿨하게 무시', animal: "cat", points: 2 },
      { label: '"이건 좀 아니지 않아요?" 한 마디 함', animal: "tiger", points: 2 },
    ],
  },
  {
    q: '클라: "미니멀한 건 좋은데, 로고 좀 키우고 글자 꽉 채워주세요."',
    choices: [
      { label: '"여백도 디자인입니다" 미니멀 사수', animal: "alpaca", points: 2 },
      { label: '"왜 지금이 더 나은지 보여드릴게요" 설득', animal: "tiger", points: 2 },
      { label: '"넵! 키워볼게요" 일단 밝게 수용', animal: "dog", points: 2 },
      { label: '"넵…(영혼없이)" 하고 적당히', animal: "cat", points: 2 },
    ],
  },
  {
    q: "작업 중인데 디렉터 마우스 커서가 내 아트보드에서 빙글빙글 돈다.",
    choices: [
      { label: "등에 식은땀. 노캔 끼고 모른 척 몰입", animal: "owl", points: 2 },
      { label: "신경 쓰여서 손 멈춤. 기분 묘함", animal: "cat", points: 2 },
      { label: '"어떤 부분 보시는 거예요?" 먼저 치고 나감', animal: "tiger", points: 2 },
      { label: '"아직 작업 중이에요! 곧 보여드릴게요" 밝게', animal: "dog", points: 2 },
    ],
  },
  {
    q: '인쇄 감리 현장. 기장님: "디자이너님, 이 색감 이대로 밀어요?"',
    choices: [
      { label: "모니터 원본이랑 1:1 대조, 채도 2%까지 잡아냄", animal: "sloth", points: 2 },
      { label: "컬러칩·룰러 꺼내 측정. 미리 뽑아온 가이드대로", animal: "otter", points: 2 },
      { label: '"여기 빨강만 톤 살짝 빼주세요" 현장 디렉션', animal: "tiger", points: 2 },
      { label: '"근데 이 종이 질감 어디 거예요?" 갑자기 딴 데 꽂힘', animal: "alpaca", points: 2 },
    ],
  },
  {
    q: '형용사 지옥 피드백: "감각적이고 고급진데 MZ스럽게, 눈에 띄는데 안 튀게."',
    choices: [
      { label: '"레퍼 딱 한 장만 주시면 정리됩니다"', animal: "otter", points: 2 },
      { label: '"그 중에 1순위가 뭐세요?" 우선순위부터', animal: "tiger", points: 2 },
      { label: "영혼 가출… 일단 내 느낌대로", animal: "cat", points: 2 },
      { label: '"넵! 다 반영해볼게요" (다 반영은 불가능)', animal: "dog", points: 2 },
    ],
  },
  {
    q: '"이거 금방 되죠? 5분이면 되잖아"',
    choices: [
      { label: '"네 됩니다" 해놓고 결국 3시간 밤샘', animal: "fox", points: 2 },
      { label: '"그 5분 위해 템플릿 미리 만들어 뒀죠" 진짜 5분', animal: "otter", points: 2 },
      { label: '"제대로 하려면 좀 걸려요…" 디테일 양보 못 함', animal: "sloth", points: 2 },
      { label: '"뭘 5분이래" 속으로 판 다시 짜는 중', animal: "tiger", points: 2 },
    ],
  },
  {
    q: "클라가 하필 '버리려던 B안'을 골랐다.",
    choices: [
      { label: '"그게… 사실 제일 안 고른 건데" 속으로 한숨', animal: "alpaca", points: 2 },
      { label: '"1안이 왜 더 나은지 설명드릴게요" 설득 모드', animal: "tiger", points: 2 },
      { label: '"아 그거…(영혼없이) 넵 그걸로"', animal: "cat", points: 2 },
      { label: '"그럼 그 안 디테일 다시 잡을게요" 묵묵히 수긍', animal: "sloth", points: 2 },
    ],
  },
  {
    q: "마감 D-3. 솔직한 진행률은?",
    choices: [
      { label: "0%. 근데 마지막 날 기적처럼 다 함 (이미 해봄)", animal: "fox", points: 2 },
      { label: "며칠 전 끝냄. 지금은 1px 디테일 만지는 중", animal: "sloth", points: 2 },
      { label: "30%. 삘만 오면 하룻밤에 순삭 가능", animal: "cat", points: 2 },
      { label: "노캔 끼고 잠수하다 막판에 한 방으로 몰아침", animal: "owl", points: 2 },
    ],
  },
  {
    q: "폭풍 마감 오후 3시. 나에게 가장 필요한 '작업 부스터'는?",
    choices: [
      { label: "단축키·듀얼모니터 각도까지 완벽한 환경", animal: "otter", points: 2 },
      { label: "노이즈캔슬링 ON, 슬랙 OFF, 세상과 단절", animal: "owl", points: 2 },
      { label: "화면 구석 카운트다운 타이머 (발등에 불!)", animal: "fox", points: 2 },
      { label: '동료랑 "우리 파이팅!" 텐션 끌올', animal: "dog", points: 2 },
    ],
  },
  {
    q: '"내일 오전까지 시안 3개 퀵하게 볼 수 있을까요?" 돌발 요청.',
    choices: [
      { label: '"오히려 좋아" 밤샘 벼락치기 돌입', animal: "fox", points: 2 },
      { label: '"방향부터 쪼개죠" 디렉션 잡고 구조화', animal: "tiger", points: 2 },
      { label: '"미리 만든 템플릿 출동" 공장 가동', animal: "otter", points: 2 },
      { label: '"일단 예쁜 거 다 모아!" 핀터 레퍼 짬뽕', animal: "dog", points: 2 },
    ],
  },
  {
    q: '"요즘 유행하는 그 스타일로 확 바꿔주세요." (트렌드 요청)',
    choices: [
      { label: '"원하신 그 느낌, 이거 맞죠?" 기막히게 힙하게 화답', animal: "chameleon", points: 2 },
      { label: '"유행은 6개월 뒤 촌스러워져요" 오리지널리티 사수', animal: "alpaca", points: 2 },
      { label: '"아…네…" 해놓고 결국 내 삘대로', animal: "cat", points: 2 },
      { label: '"오 그 방향도 좋네요! 레퍼 더 섞어볼게요"', animal: "dog", points: 2 },
    ],
  },
  {
    q: "진짜_최종_진짜마지막.zip을 넘겼다. 직후의 나는?",
    choices: [
      { label: "흔한 소스 1도 안 쓴 나에게 취해있음", animal: "alpaca", points: 2 },
      { label: "1px 오차 없는 깔끔한 파일에 흐뭇", animal: "sloth", points: 2 },
      { label: "하얗게 불태웠다… 슬랙 끄고 잠수", animal: "cat", points: 2 },
      { label: '"역시 난 마감 체질" 벼락치기 화력에 짜릿', animal: "fox", points: 2 },
    ],
  },
  {
    q: "누가 내 디자인을 대놓고 칭찬한다. 겉은 웃지만 속마음은?",
    choices: [
      { label: '"이걸 알아보네… 근데 진짜 디테일은 안 보이지"', animal: "alpaca", points: 2 },
      { label: '"저 1px, 저 자간 보이세요…?"', animal: "sloth", points: 2 },
      { label: '"당연하지. 내가 했는데"', animal: "tiger", points: 2 },
      { label: '"아…넵 감사합니다" 하고 빨리 도망', animal: "owl", points: 2 },
    ],
  },
  {
    q: "명함·굿즈 실물이 도착했다. 박스 열고 첫 행동은?",
    choices: [
      { label: "박·형압 디테일 손끝으로 확인, 오타부터 스캔", animal: "sloth", points: 2 },
      { label: '종이 질감부터 음미. "이 지질 좋다"', animal: "alpaca", points: 2 },
      { label: "바로 단톡방에 인증샷 📸", animal: "dog", points: 2 },
      { label: '"다음엔 후가공 더 세게 가자"', animal: "tiger", points: 2 },
    ],
  },
  {
    q: "쨍하던 형광 그린이 인쇄로 칙칙하게 나왔다. (CMYK 충격) 내 반응은?",
    choices: [
      { label: "별색·CMYK 수치 다시 계산해서 재교정", animal: "otter", points: 2 },
      { label: "색 맞을 때까지 감리 다시 잡음", animal: "sloth", points: 2 },
      { label: '"어차피 마감, 비슷하면 밀어요"', animal: "fox", points: 2 },
      { label: '"오히려 이 색이 분위기 있는데?" 정신승리', animal: "cat", points: 2 },
    ],
  },
  {
    q: '"그거 AI로 한 거 아냐?" 누가 묻는다.',
    choices: [
      { label: '"요즘 다 쓰죠" 당당하게 활용파', animal: "chameleon", points: 2 },
      { label: '"전 손맛이 있어야…" AI 거부파', animal: "alpaca", points: 2 },
      { label: "워크플로에 AI까지 세팅 완비", animal: "otter", points: 2 },
      { label: "조용히 쓰지만 말 안 함", animal: "owl", points: 2 },
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
    return ANIMALS[a].tieOrder - ANIMALS[b].tieOrder;
  });

  const top = sorted[0];
  const second = sorted[1];
  const scoredCount = SCORED_IDS.filter((id) => scores[id] >= 1).length;

  if (second && scores[top] - scores[second] <= 1 && scoredCount >= 6) {
    return SWAN;
  }
  return ANIMALS[top];
}
