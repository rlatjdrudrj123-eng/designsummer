# CLAUDE.md · Design Summer 2026 마이크로사이트

K-PRINT 2026 동시 개최 디자인 컨퍼런스 "Design Summer(디자인 썸머 일산)"의 홍보용 독립 마이크로사이트.
**모든 UI 작업 전에 `DESIGN_GUIDE.md`를 읽는다. 충돌 시 가이드가 이긴다.**

## 0. 콘텐츠 진실의 출처 (Source of Truth) — 먼저 읽을 것

> 이 문서는 한때 빌드된 사이트와 크게 어긋나 있었고(실제로 누군가 `content/site.json`을
> 라이브 카피로 오인함), 아래 내용은 **실제 코드를 읽어 검증한 사실**이다. 작업 전 반드시 숙지한다.

- **라이브 진입점 = `app/page.tsx` → `<AuraSite />`** (`components/aura/AuraSite.tsx`).
  라이브 본문은 전부 `components/aura/*` 컴포넌트 트리에서 렌더된다. 다른 화면(`SiteMain`,
  `DevelopSite`, `variants/*`, `aura1/*`)은 **라이브가 아니다**(아래 "시안 라우트" 참고).

- **라이브 본문 카피의 단일 소스 = `lib/conference.ts`** (`conference` 객체).
  슬로건·인트로·Day 요약·타임테이블·연계 이벤트·오시는 길·FAQ·문의 등 라이브 `/`에 보이는
  본문은 전부 여기서 나온다. **카피 수정은 `lib/conference.ts`에서 한다.** 코드에 본문 하드코딩 금지.

- **연사(라인업) 데이터 = `content/speakers.json`(base, 8명) + `content/auraSpeakers.json`(override, 8키)**.
  `lib/auraContent.ts`가 둘을 머지한다(override 값이 비어있지 않으면 override가 이김).
  라이브 Lineup(`components/aura/Lineup.tsx`)은 `auraSpeakersByDay()`를 쓴다.

- **⚠️ `content/site.json`은 (거의 전부) 라이브 카피가 아니다.**
  라이브에서 실제로 읽는 필드는 **`applyUrl`(`components/aura/FloatingBar.tsx`)와
  `contact`(`components/aura/Footer.tsx`) 둘뿐**이다. `concept`(NEW PERSPECTIVES/EXPANDING
  PRACTICE), `host`, `dates`, `venue`, `capacity`, `intro`, `title` 등 나머지 필드는
  **시안 라우트(`/develop`·`/variants`·`/aura1` 등) 전용**이며 라이브 `/`에는 렌더되지 않는다.
  → **site.json의 본문을 고쳐도 라이브 `/`는 바뀌지 않는다.** 라이브 본문은 `lib/conference.ts`다.

- **시안 라우트는 라이브가 아니다.** `/aura`(라이브 미러), `/aura1`, `/develop`, `/variants`는
  디자인 탐색·미리보기본이며 `app/robots.ts`가 색인을 차단한다(noindex). 정식 출시 대상은 `/` 하나.

## 1. 행사 정보 (고정값 · 출처 `lib/conference.ts`)

- 행사명: Design Summer 2026 / 디자인 썸머 일산
- 슬로건/컨셉: **"the creative heatwave"**
- 일시: 2026.08.20(목) ~ 08.21(금), 2일 (세션 13:00–16:30, 12:00 등록 시작)
- 장소: KINTEX 제2전시장 3층 301호 (경기도 고양시 일산서구 킨텍스로 217-59)
- 정원: 일 150명 (일자별 선착순 사전등록 마감)
- 주최: 한국이앤엑스 K-PRINT 사무국 / 파트너: 디자인하우스
- 가격: **얼리버드 20,000원 / 정상 50,000원 (1일권)**
- 신청: 사이트 내 폼 없음. **일자별** K-PRINT 컨퍼런스 페이지로 링크아웃.
  - section A (8.20 목): `https://kprint.kr/ko/conference/32`
  - section B (8.21 금): `https://kprint.kr/ko/conference/30`
  - (URL 출처: `lib/conference.ts`의 `hero.register`. 라이브 CTA는 일자별 2개 버튼.)
- **세션 컨셉(일자별 · 실제값):**
  - **Day 1 — section A · "디자인의 새로운 관점"** (creative day): 브랜딩, 모션그래픽, AI 등
    새로운 툴·시각으로 크리에이티브를 확장하는 기획·방법론.
  - **Day 2 — section B · "디자인 실무의 확장"** (craft day): 비즈니스 논리, 후가공(박인쇄),
    매체별 출력 편차 등 실물 제작 단계의 디테일.
  - ⚠️ 옛 문서의 "HEAT SOURCE / HEAT TRANSFER" 컨셉은 **현재 코드에 존재하지 않는다(폐기).**
    site.json의 "NEW PERSPECTIVES / EXPANDING PRACTICE" 영문 라벨도 **시안 전용**이며 라이브 카피 아님.

## 2. 스택 (변경 금지)

- Next.js(App Router) + TypeScript
- 스타일: 전역 CSS 토큰 + CSS Modules. **Tailwind·UI 라이브러리·애니메이션 라이브러리 사용 금지** (모션은 CSS와 rAF로 직접)
- 캔버스 모션: Canvas 2D + rAF 직접 구현(예: 히어로 열 블롭 `components/develop/HeatBlob`). 게임엔진·three.js 금지
- 호스팅: Firebase App Hosting(Next.js SSR, GitHub 연동 배포). 도메인: design-summer.kr.
  - 이미지 저장: **(1단계) 레포 `public/uploads` 커밋 기반 정적 서빙** + `content/images.json` 매니페스트.
    런타임 업로드는 Cloud Run 인스턴스의 ephemeral FS라 프로덕션에 영속되지 않으므로,
    개발자가 업로드 결과 파일을 **커밋해서 배포**한다. → **(2단계) Firebase Storage 이관 예정.**
  - ※ 이전 계획(Vercel/Vercel Blob)에서 변경됨. 코드 주석 일부에 옛 "Vercel Blob" 표현이 남아 있어도 현재 저장소는 `public/uploads`다.
- 폰트: Pretendard Variable(CDN), Instrument Sans(구글 폰트). `--font-display` 변수로 추상화

## 3. 라우트

- **`/` (라이브, 색인 대상)** : 원페이지. `app/page.tsx` → `<AuraSite />`.
  실제 섹션 순서(`components/aura/AuraSite.tsx` 기준):
  **Hero → Overview → Timetable → EventInfo → Day 1 라인업(`#day1`) → Day 2 라인업(`#day2`)
  → Benefits → FAQ → Directions(오시는 길) → Footer.**
  (스크롤에 따라 Day1 RED → Day2 GOLD로 변하는 워밍 오라 배경 + 커서 라이트스팟.
  `TempTest`(온도 테스트)는 현재 클라이언트 요청으로 주석 처리되어 비노출.)
- **`/admin`** : 이미지 관리. `/admin/login`에서 로그인. `ADMIN_PASSWORD`로 보호(미들웨어 세션 검증).
- **`/api/admin/*`** : `upload`·`delete`·`link`·`aura-text`·`login`·`logout`. **`/api/img/[key]`** : 이미지 서빙.
- **시안/탐색용 noindex 라우트 (라이브 아님 · `app/robots.ts`가 색인 차단):**
  - `/aura` — 라이브 미러(작업/미리보기용, 출시 전 정리 대상)
  - `/aura1` — Aura 디자인 초기 탐색본
  - `/develop` — 디자인 컨셉 탭 모음(여러 레이아웃이 `lib/conference.ts` 동일 콘텐츠를 렌더)
  - `/variants` — 시안 변형 모음(원본 `SiteMain`은 여기 "원본" 탭에 보존)

## 4. 데이터 구조

라이브 본문은 코드 상수(`lib/conference.ts`)와 연사 JSON에서 나온다. 정리하면:

| 무엇 | 어디 | 라이브 사용처 |
| --- | --- | --- |
| 본문 카피(슬로건·Day·타임테이블·이벤트·오시는길·FAQ·문의) | `lib/conference.ts` | `components/aura/*` 전반 |
| 연사 base(구조: id/day/order/time/studioEn/imageKey 등) | `content/speakers.json` (8명) | `lib/content.ts`의 `speakers` |
| 연사 override(어드민 "Aura 연사 내용"에서 수정) | `content/auraSpeakers.json` (8키) | `lib/auraContent.ts`가 머지 |
| 신청 URL · 문의 이메일 | `content/site.json`의 `applyUrl`·`contact` | FloatingBar / Footer |
| (site.json의 그 외 필드) | `content/site.json` | **라이브 미사용 — 시안 전용** |
| 업로드 이미지 매니페스트 | `content/images.json` | `lib/serverImages.ts` |
| 이미지별 링크 | `content/imageLinks.json` | 어드민 |

연사(`speakers.json`) 스키마:

```jsonc
{
  "id": "rojotype",
  "day": 1,                  // 1 | 2
  "order": 1,
  "time": "13:00 - 13:45",
  "studio": "로호타입",
  "studioEn": "rojotype",
  "name": "김기창",
  "role": "그래픽·타입 디자이너",
  "sessionTitle": "로호타입이 만난 인쇄 초심자들",
  "sessionDesc": "…",
  "credentials": ["…"],
  "imageKey": "speaker-rojotype",  // 어드민 업로드 키
  "url": "…"                       // 선택: 연사/스튜디오 홈페이지
}
```

라인업(검증된 실제 데이터):

- **Day 1 (section A):** 로호타입 김기창 · "로호타입이 만난 인쇄 초심자들" / 오디너리피플 서정민 · "브랜드를 만드는 세 가지 질문" / 우트크리에이티브 고성우 · "필요 없는 건 다 끕니다: 예쁜 걸 넘어 설득이 되는 모션그래픽" / 아카브릭 조명훈 · "AI 시대, 디자이너는 무엇에 집중해야 하는가?"
- **Day 2 (section B):** 아우라지디자인 박진택 · "컨셉을 관통하는 창의적인 브랜드 비주얼" / 오세븐 배수규 · "디자인은 취향이 아닌 비즈니스다" / 태창금박지 이호준 · "디자인을 완성하는 박인쇄의 힘" / 패터니스튜디오 이요안나 · "패턴디자인 출력에서 고려해야 할 내용"

크레덴셜·세션 설명은 클라이언트 제공 원고의 사실만 사용, 과장 수식 금지(`lib/conference.ts` 상단 주석 참조).

## 5. 어드민 스펙

- 기능은 이미지 관리 중심: 브랜드 로고, KV, 연사 프로필 8, (그 외 슬롯). 슬롯별 업로드·교체·삭제.
  추가로 "Aura 연사 내용" 텍스트 편집(`/api/admin/aura-text` → `content/auraSpeakers.json`)과 이미지 링크 설정 지원.
- 업로드 저장: `public/uploads` + `content/images.json`(`lib/serverImages.ts`). 프로덕션은 커밋해 정적 서빙.
- 디자인: 시스템 폰트, 흰 바탕, 헤어라인 표. 본 사이트 토큰 미사용.

## 6. 보안 (최근 적용 · 검증됨)

- `ADMIN_PASSWORD`는 **Secret Manager 시크릿을 런타임 주입**(`apphosting.yaml`). (선택) `SESSION_SECRET`로 서명 키 분리 가능.
- 세션 쿠키(`ds_admin`)에는 **평문 비밀번호가 아니라 HMAC-SHA256 서명 토큰**만 저장(`lib/adminAuth.ts`,
  Web Crypto로 Edge/Node 양쪽 호환). 검증은 상수시간 비교.
- 업로드 검증(`lib/serverImages.ts`): **key 화이트리스트**(`^[a-z0-9][a-z0-9-]*$`, 경로 탐색 차단),
  **매직넘버 스니핑**(file.name 불신, png/jpg/gif/webp/avif/svg 허용), **크기 상한 8MB**, 경로 이탈 방어.

## 7. 작업 규칙

- **카피 수정은 `lib/conference.ts`에서.** site.json을 라이브 카피로 착각하지 말 것(0장·4장 참조).
- 라이브 화면 작업은 `components/aura/*`에서. 시안(`develop`/`variants`/`aura1`) 컴포넌트는 라이브에 영향 없음.
- 매 작업 종료 시 DESIGN_GUIDE.md 12장 체크리스트를 돌리고 결과를 기록.
- 스크린샷 자체 검수: 데스크톱 1440px, 모바일 390px 두 컷 기준.
- 라이브러리 추가·스택 변경·디자인 토큰 수정이 필요하면 작업 전에 사용자에게 물어볼 것.
- 카피 작성·수정 시 가이드 9장 톤 규칙 준수. 임의로 마케팅 카피를 지어내지 않는다(원고 사실만).

## 부록 · 옛 계획에서 폐기/미구현으로 판정한 항목 (코드 검증 결과)

- **아이소메트릭 씬("301호 미리 걸어보기", `public/scene/*.svg`, 타일 그리드, 캐릭터 이동, 카드 오버레이):
  코드에 존재하지 않음 → 폐기/미구현.** 근거: `public/scene/` 디렉터리 없음, `components/aura/`에
  아이소메트릭/타일 렌더러 없음, 라이브 `AuraSite` 섹션 순서에 해당 씬 없음. (히어로의 Canvas 2D
  "열 블롭"(`HeatBlob`)은 별개로 존재함 — 혼동 주의.)
- **"HEAT SOURCE / HEAT TRANSFER" Day 컨셉: 폐기.** 현재 라이브 Day 컨셉은 "디자인의 새로운 관점 /
  디자인 실무의 확장"(1장). 근거: `lib/conference.ts`.
- 옛 빌드 순서(Phase 1~6) 중 "아이소메트릭 씬" 단계는 위 사유로 무효. 그 외 토큰/히어로/콘텐츠
  섹션/어드민/폴리시 단계의 산출물은 현재 `components/aura/*`·`app/admin`에 구현되어 있음.
