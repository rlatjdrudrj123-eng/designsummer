import styles from "./Directions.module.css";

/* [HEATMAP 변형] 원본 components/sections/VenueMap.tsx 클론.
   ★ 열 강조색만 heatmap 핫 레드(#e6281e)로 교체 (원본은 오렌지 #E84A20). */
const HEAT = "#e6281e";
const INK = "#0A0A0A";

export default function VenueMap() {
  return (
    <svg
      className={styles.map}
      viewBox="0 0 1100 340"
      role="img"
      aria-label="KINTEX 제2전시장 3층 301호 안내 도면 (샘플)"
    >
      <text x="28" y="30" fontSize="14" fontWeight="700" fill={INK}>
        KINTEX 제2전시장 · 3F
      </text>
      {/* 건물 외곽 */}
      <rect x="24" y="48" width="1052" height="248" fill="none" stroke={INK} strokeWidth="1.5" />

      {/* 상단 회의실 열 */}
      {/* 301호 (목적지, 열 강조) */}
      <rect x="44" y="64" width="360" height="150" fill="rgba(230,40,30,0.1)" stroke={HEAT} strokeWidth="2" />
      <text x="224" y="132" fontSize="22" fontWeight="800" fill={INK} textAnchor="middle">301호</text>
      <text x="224" y="158" fontSize="13" fontWeight="600" fill={HEAT} textAnchor="middle">Design Summer</text>

      <rect x="420" y="64" width="300" height="150" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.45" />
      <text x="570" y="146" fontSize="15" fill={INK} opacity="0.5" textAnchor="middle">302호</text>

      <rect x="736" y="64" width="316" height="150" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.45" />
      <text x="894" y="146" fontSize="15" fill={INK} opacity="0.5" textAnchor="middle">303호</text>

      {/* 복도 */}
      <rect x="24" y="230" width="1052" height="66" fill="rgba(10,10,10,0.04)" />
      <text x="760" y="268" fontSize="13" fill={INK} opacity="0.5" textAnchor="middle">로비 · 복도</text>

      {/* 에스컬레이터 / 정문 */}
      <rect x="520" y="248" width="72" height="34" fill="none" stroke={INK} strokeWidth="1.2" />
      <text x="556" y="270" fontSize="11" fill={INK} opacity="0.6" textAnchor="middle">ESC</text>
      <text x="556" y="324" fontSize="12" fontWeight="600" fill={INK} textAnchor="middle">▲ 정문 / 에스컬레이터</text>

      {/* 동선 (열 점선) */}
      <path
        d="M556 248 L556 224 L224 224 L224 214"
        fill="none"
        stroke={HEAT}
        strokeWidth="2.5"
        strokeDasharray="2 8"
        strokeLinecap="round"
      />
      <path d="M216 224 L224 212 L232 224" fill="none" stroke={HEAT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
