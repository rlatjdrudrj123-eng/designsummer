import styles from "./Hero.module.css";
import HeatBlob from "@/components/develop/HeatBlob";
import { sairaCondensed } from "@/components/develop/developFont";
import { type Lang } from "@/components/develop/developEn";
import { conference } from "@/components/develop/conference";
import { imageUrl } from "@/lib/images";

/* 히어로 메타 고정값 — KV 우-중앙 클러스터의 날짜·장소 두 줄.
   메인 `/` 히어로(components/aura/Hero.tsx)의 .venueMeta/.metaLine 트리트먼트를
   미러링한다: 컴팩트 날짜 포맷 + 층·호수 없는 짧은 장소명. */
const HERO_DATE = "08.20.목 - 08.21.금";
const HERO_VENUE = "KINTEX 제2전시장";

/* 히어로 (Aura1 전용 포크) — 공식 컨퍼런스 카피(conference.hero)를 렌더한다.
   공유 develop/Hero 에서 분기한 사본으로, /aura 및 develop 탭에는 영향이 없다.

   === KV 충실도 복원 =========================================================
   이전 실험(HeroHeat 포크 + 글로우 타이틀)이 KV 에서 벗어났던 것을 되돌린다:
   KV 는 (1) 두 워밍 로브가 목으로 이어진 "아령(dumbbell)" 열 필드, (2) 열 위에
   납작한 near-black 타이틀(글로우 없음), 매끈한 표면이다.

   1) HEAT FIELD = KV 아령. 단일 코어 합성 + 하프톤/그레인 텍스처를 버리고,
      메인 `/` 히어로와 동일한 공유 캘리브레이션 필드(@/components/develop/HeatBlob)
      를 렌더한다 — kv.png 에 피팅된 정확한 KV 아령 실루엣. 단일 코어 포크
      HeroHeat.tsx/.module.css 는 삭제했다. develop/HeatBlob 은 수정 금지.
   2) 타이틀 = 납작한 near-black. 실험이 더했던 따뜻한 라디언트 글로우/번짐
      (text-shadow)을 제거 — KV 처럼 열 위에 또렷한 잉크 글자만. 서체는
      210 옴니고딕("omnigothic", 전역 로더, ~600) 유지. 고스트 클립 픽스 유지.

   KV 정합 업데이트: (a) 우상단 K·print 워드마크 추가(메인 `/` 히어로 .logoTr 미러링,
   imageUrl("kprint-logo") 있으면 이미지·없으면 텍스트). (b) 좌하단 세로 스튜디오
   리스트 제거(이름은 아래 라인업에 존재). (c) 우-중앙 클러스터를 KV 대로 정렬 —
   작은 어두운 2026℃ → 타이틀 → "KINTEX 제2전시장" 장소 라인(날짜/시간 없음).
   유지: 아령 HeatBlob · 페이퍼 그레인 · 좌측 소문자 태그라인 · 따뜻한 솔리드 CTA. */
export default function Hero({ lang = "ko" }: { lang?: Lang }) {
  const en = lang === "en";
  const { register } = conference.hero;
  const logoSrc = imageUrl("kprint-logo");
  // 사전등록 라벨에서 " (8.20 목)" / " (8.21 금)" 괄호(날짜·요일) 제거.
  const stripParen = (label: string) => label.replace(/\s*\(.*?\)\s*$/, "");

  return (
    <section id="top" className={styles.hero}>
      <HeatBlob />

      {/* 우상단 — K·print 로고 (KV 미러링). 어드민 업로드(kprint-logo) 있으면 이미지,
          없으면 텍스트 워드마크. 메인 `/` 히어로(.logoTr)와 동일한 우상단 거터 정렬. */}
      {logoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={`${styles.logo} ${styles.logoTr}`}
          src={logoSrc}
          alt="K·print"
          style={{ height: "clamp(22px, 2.2vw, 34px)", width: "auto" }}
        />
      ) : (
        <span className={`${styles.logo} ${styles.logoTr}`} aria-label="K·print">
          K&middot;print
        </span>
      )}

      {/* 페이퍼 그레인 텍스처 — 정적 SVG feTurbulence 노이즈 데이터 URI 오버레이.
          캔버스/JS 없음(런타임 비용 0). 열 필드(z-index:0) 위, 텍스트(z-index:2)
          아래(z-index:1)에 깔려 표면에 인쇄물 같은 결을 준다. pointer-events 없음. */}
      <div className={styles.grain} aria-hidden="true" />

      {/* 텍스트 락업은 카드와 동일한 중앙 거터(min(1100px,94%)) 안에 정렬.
          열 KV·하단 블렌드만 풀블리드로 남는다. */}
      <div className={styles.gutter}>
        {/* (d) 정보 다이어트 — 좌측 리드 클러스터(배지·서브타이틀·desc) 전부 제거.
            동일 정보는 아래 About 섹션에 존재하므로 히어로 좌측은 비워 둔다. */}

        {/* (변경 1) 태그라인 + 타이틀을 같은 가로 ROW 에 둔다.
            KV 미러링 — 소문자 태그라인 "the creative heatwave" 를 거터 좌측 끝에 두되,
            세로 위치를 우측 타이틀 라인("디자인 썸머 일산")의 세로 중앙에 맞춘다
            (2026℃ 마크·메타가 아니라 타이틀 줄에 정렬). 1440px 에서 한 가로 띠로
            "the creative heatwave … 디자인 썸머 일산" 이 읽힌다. 폭을 묶어 겹침 방지.
            390px 에선 미디어쿼리에서 타이틀 클러스터 위로 깔끔히 쌓인다. */}
        <p className={styles.tagline}>the creative heatwave</p>

        {/* 타이틀 클러스터 (우측 치우침, 거터 안) — KV 우-중앙 클러스터 미러링:
            (변경 2) 작은 어두운 2026℃ 키커를 타이틀 바로 위에 바짝 붙인다(우측 정렬).
            (변경 3) 타이틀 아래는 날짜+장소 두 줄 메타 블록(메인 히어로 .venueMeta 미러링). */}
        <div className={styles.titleBlock}>
          {/* 2026℃ — 타이틀 우측 끝에 맞춘 작은 어두운 연도 키커(흰색·과대 금지). */}
          <p className={styles.mark}>
            <span className={styles.markYear}>2026°C</span>
          </p>
          {en ? (
            <h1 className={`${styles.title} ${styles.titleEn} ${sairaCondensed.className}`}>
              Design Summer <span className={styles.titleAccent}>2026</span>
            </h1>
          ) : (
            <h1 className={styles.title}>디자인 썸머 일산</h1>
          )}
          {/* (변경 3) 날짜+장소 메타 블록 — 타이틀 아래 우측 정렬 두 줄
              (메인 `/` 히어로 .venueMeta / .metaLine 트리트먼트 미러링).
              line1: 컴팩트 날짜, line2: 짧은 장소명(층·호수 없음). */}
          <p className={styles.venueMeta}>
            <span className={styles.metaLine}>{HERO_DATE}</span>
            <span className={styles.metaLine}>{HERO_VENUE}</span>
          </p>

          {/* 일자별 사전등록 2버튼 — 타이틀 클러스터 흐름 안(날짜·장소 바로 아래),
              우측 정렬. 히어로 맨 아래 절대배치였던 걸 클러스터로 끌어올림. */}
          <div className={styles.register}>
            {register.map((r) => (
              <a
                key={r.day}
                className={styles.regBtn}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{stripParen(r.label)}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
