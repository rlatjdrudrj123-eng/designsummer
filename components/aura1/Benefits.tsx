import styles from "./Benefits.module.css";
import Reveal from "@/components/develop/Reveal";
import { conference } from "@/components/develop/conference";

/* 참가 혜택 (Aura1 전용 포크) — 공유 develop/BenefitsSection 에서 분기한 사본.
   /aura · develop 탭에는 영향이 없다. 본문 데이터는 공유 conference.benefits.groups
   (각 그룹: heading + items[{title, body}]) 를 그대로 렌더한다.

   Aura1 한정 변경 (클라이언트 요청):
   각 혜택을 "설명하는" 그래픽 요소를 카드마다 추가했다. 라이브러리 없이 인라인 SVG
   + CSS 로만 그린 임시(temporary) 워밍-오라 액센트다.
     · 럭키드로우           → 입체감 있는 선물상자(리본)
     · 실물 샘플킷          → 종이/샘플 스택
     · 오픈 네트워킹        → 교환하는 명함 2장
     · 사전 질문 접수       → 말풍선(질문)
   그래픽은 순수 장식이므로 aria-hidden 처리, 정보는 제목·본문 텍스트가 전담한다. */

type GraphicKind = "gift" | "samples" | "cards" | "question";

/* 카피 키워드로 어떤 그래픽을 붙일지 고른다(데이터에 그래픽 키가 없으므로 추론).
   매칭이 없으면 그룹/순서 기반 폴백으로 안정적인 placeholder 를 보장한다. */
function pickGraphic(title: string, fallback: GraphicKind): GraphicKind {
  if (title.includes("럭키드로우") || title.toLowerCase().includes("lucky")) return "gift";
  if (title.includes("샘플킷") || title.includes("샘플")) return "samples";
  if (title.includes("네트워킹")) return "cards";
  if (title.includes("질문") || title.includes("물어보세요")) return "question";
  return fallback;
}

function BenefitGraphic({ kind }: { kind: GraphicKind }) {
  return (
    <span className={styles.graphic} aria-hidden="true">
      <svg viewBox="0 0 100 100" role="presentation" focusable="false">
        {kind === "gift" && (
          <>
            {/* 입체 선물상자 — 윗면(라이트) + 정면(소프트) + 리본 */}
            <polygon className={styles.gFillSoft} points="20,40 50,28 80,40 50,52" />
            <polygon className={styles.gFill} points="20,40 50,52 50,82 20,70" opacity="0.92" />
            <polygon className={styles.gFill} points="80,40 50,52 50,82 80,70" />
            <path className={styles.gStroke} d="M20,40 50,28 80,40 50,52 Z" />
            <path className={styles.gStroke} d="M20,40 20,70 50,82 80,70 80,40" />
            <path className={styles.gStroke} d="M50,52 50,82" />
            {/* 세로 리본 + 윗면 매듭 */}
            <path className={styles.gStroke} d="M50,28 50,52" />
            <path
              className={styles.gStroke}
              d="M50,28 C42,18 33,22 39,30 M50,28 C58,18 67,22 61,30"
            />
          </>
        )}

        {kind === "samples" && (
          <>
            {/* 샘플/종이 스택 — 어긋나게 쌓인 시트, 위 시트에 코너 접힘 */}
            <rect className={styles.gFillSoft} x="22" y="58" width="52" height="14" rx="3" />
            <rect className={styles.gFillSoft} x="26" y="46" width="52" height="14" rx="3" />
            <rect className={styles.gFill} x="30" y="26" width="40" height="34" rx="4" />
            <path className={styles.gStroke} d="M22,58 h52 v14 h-52 Z" />
            <path className={styles.gStroke} d="M26,46 h52 v14 h-52 Z" />
            <path className={styles.gStroke} d="M30,30 a4,4 0 0 1 4,-4 h28 l8,8 v22 a4,4 0 0 1 -4,4 h-32 a4,4 0 0 1 -4,-4 Z" />
            <path className={styles.gStroke} d="M62,26 v8 h8" />
          </>
        )}

        {kind === "cards" && (
          <>
            {/* 오픈 네트워킹 — 교환하는 명함 2장(엇갈린 회전) */}
            <g transform="rotate(-12 50 50)">
              <rect className={styles.gFillSoft} x="16" y="40" width="44" height="28" rx="4" />
              <path className={styles.gStroke} d="M16,44 a4,4 0 0 1 4,-4 h36 a4,4 0 0 1 4,4 v20 a4,4 0 0 1 -4,4 h-36 a4,4 0 0 1 -4,-4 Z" />
              <path className={styles.gStroke} d="M22,50 h14 M22,58 h22" />
            </g>
            <g transform="rotate(12 50 50)">
              <rect className={styles.gFill} x="40" y="34" width="44" height="28" rx="4" />
              <path className={styles.gStroke} d="M40,38 a4,4 0 0 1 4,-4 h36 a4,4 0 0 1 4,4 v20 a4,4 0 0 1 -4,4 h-36 a4,4 0 0 1 -4,-4 Z" />
              <path className={styles.gStroke} d="M46,44 h14 M46,52 h22" />
            </g>
          </>
        )}

        {kind === "question" && (
          <>
            {/* 사전 질문 — 말풍선 + 물음표 */}
            <path
              className={styles.gFillSoft}
              d="M24,24 h52 a8,8 0 0 1 8,8 v28 a8,8 0 0 1 -8,8 H44 l-14,12 v-12 h-6 a8,8 0 0 1 -8,-8 V32 a8,8 0 0 1 8,-8 Z"
            />
            <path
              className={styles.gStroke}
              d="M24,24 h52 a8,8 0 0 1 8,8 v28 a8,8 0 0 1 -8,8 H44 l-14,12 v-12 h-6 a8,8 0 0 1 -8,-8 V32 a8,8 0 0 1 8,-8 Z"
            />
            <path
              className={styles.gStroke}
              d="M42,38 a8,8 0 0 1 16,0 c0,7 -8,7 -8,13"
            />
            <circle className={styles.gAccent} cx="50" cy="58" r="3.4" />
          </>
        )}
      </svg>
    </span>
  );
}

export default function Benefits() {
  const { groups } = conference.benefits;

  return (
    <section id="benefits" className={`${styles.benefits} shell`}>
      <Reveal>
        <h2 className={styles.heading}>연계 이벤트 및 참가 혜택</h2>

        <div className={styles.groups}>
          {groups.map((g, gi) => (
            <div key={gi} className={styles.group}>
              <h3 className={styles.groupHeading}>{g.heading}</h3>
              <ul className={styles.items}>
                {g.items.map((item, i) => (
                  <li key={i} className={styles.item}>
                    <BenefitGraphic kind={pickGraphic(item.title, gi === 0 ? "question" : "gift")} />
                    <div className={styles.text}>
                      <p className={styles.itemTitle}>{item.title}</p>
                      <p className={styles.itemBody}>{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
