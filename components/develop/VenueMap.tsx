import styles from "./Directions.module.css";

/* 오시는 길 샘플 도면 — 제2전시장 3F, 301호 위치와 동선 스키매틱(가로형).
   Aura 톤에 맞춰 부드럽게: 거친 빨강 점선/실선 테두리 대신 301호를 따뜻한
   글로우/소프트 필로 강조하고, 라벨은 톤 잉크로. 코드로 그린 온브랜드 플랜. */
const INK = "#0A0A0A";
const HEAT = "#E84A20";
const HEAT_MID = "#ED7D1D";

export default function VenueMap() {
  return (
    <svg
      className={styles.map}
      viewBox="0 0 1100 340"
      role="img"
      aria-label="KINTEX 제2전시장 3층 301호 안내 도면 (샘플)"
    >
      <defs>
        {/* 301호 따뜻한 글로우 — 거친 빨강 점선 대신 부드러운 열 번짐. */}
        <radialGradient id="vmRoomGlow" cx="50%" cy="46%" r="62%">
          <stop offset="0%" stopColor={HEAT} stopOpacity="0.26" />
          <stop offset="55%" stopColor={HEAT_MID} stopOpacity="0.14" />
          <stop offset="100%" stopColor={HEAT_MID} stopOpacity="0.04" />
        </radialGradient>
        <linearGradient id="vmRouteFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={HEAT_MID} stopOpacity="0.7" />
          <stop offset="100%" stopColor={HEAT} stopOpacity="0.85" />
        </linearGradient>
        <filter id="vmSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <text x="28" y="30" fontSize="14" fontWeight="700" fill={INK} opacity="0.78">
        KINTEX 제2전시장 · 3F
      </text>

      {/* 건물 외곽 — 톤 잉크 헤어라인 */}
      <rect
        x="24"
        y="48"
        width="1052"
        height="248"
        rx="14"
        fill="none"
        stroke={INK}
        strokeOpacity="0.16"
        strokeWidth="1.5"
      />

      {/* 301호 (목적지) — 부드러운 열 글로우 + 라운드 소프트 필, 점선 없음 */}
      <rect
        x="44"
        y="64"
        width="360"
        height="150"
        rx="12"
        fill="url(#vmRoomGlow)"
        stroke={HEAT}
        strokeOpacity="0.55"
        strokeWidth="1.5"
      />
      <text x="224" y="132" fontSize="22" fontWeight="800" fill={INK} textAnchor="middle">
        301호
      </text>
      <text x="224" y="158" fontSize="13" fontWeight="600" fill={HEAT} textAnchor="middle">
        Design Summer
      </text>

      {/* 인접 회의실 — 톤 잉크, 약하게 */}
      <rect x="420" y="64" width="300" height="150" rx="12" fill="none" stroke={INK} strokeOpacity="0.16" strokeWidth="1.2" />
      <text x="570" y="146" fontSize="15" fill={INK} opacity="0.42" textAnchor="middle">302호</text>

      <rect x="736" y="64" width="316" height="150" rx="12" fill="none" stroke={INK} strokeOpacity="0.16" strokeWidth="1.2" />
      <text x="894" y="146" fontSize="15" fill={INK} opacity="0.42" textAnchor="middle">303호</text>

      {/* 복도 — 아주 옅은 톤 면 */}
      <rect x="24" y="230" width="1052" height="66" rx="10" fill="rgba(10,10,10,0.035)" />
      <text x="760" y="268" fontSize="13" fill={INK} opacity="0.46" textAnchor="middle">로비 · 복도</text>

      {/* 에스컬레이터 / 정문 */}
      <rect x="520" y="248" width="72" height="34" rx="8" fill="none" stroke={INK} strokeOpacity="0.3" strokeWidth="1.2" />
      <text x="556" y="270" fontSize="11" fill={INK} opacity="0.55" textAnchor="middle">ESC</text>
      <text x="556" y="324" fontSize="12" fontWeight="600" fill={INK} opacity="0.7" textAnchor="middle">▲ 정문 / 에스컬레이터</text>

      {/* 동선 — 부드러운 열 실선(글로우) + 라운드. 거친 점선 제거. */}
      <path
        d="M556 248 L556 224 L224 224 L224 214"
        fill="none"
        stroke="url(#vmRouteFade)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
        filter="url(#vmSoft)"
      />
      <path
        d="M556 248 L556 224 L224 224 L224 214"
        fill="none"
        stroke="url(#vmRouteFade)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M216 224 L224 212 L232 224"
        fill="none"
        stroke={HEAT}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
