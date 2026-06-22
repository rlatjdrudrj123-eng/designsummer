import type { CSSProperties } from "react";
import styles from "./Spark.module.css";

type SparkleProps = {
  size: number;
  /** absolute-ish placement within a relatively-positioned parent */
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  /** twinkle phase offset in seconds (negative animation-delay) */
  phase?: number;
  /** kept for caller compatibility — no longer used (spark is the only shape) */
  points?: number;
  variant?: "plain" | "bang" | "query";
  /** override fill (default = spark yellow) */
  fill?: string;
  className?: string;
};

/* SPARK 의 단 하나의 모티프 — 7갈래 날카로운 스파크 별(불규칙 스파이크, 깊은 노치).
   느낌표/물음표 없음: 여기는 진짜 'spark'가 메인. */
const SPIKES = 7;
const INNER = 0.3; // 깊은 노치 → 날카로운 스파이크
// 스파이크별 길이·각도 변주(불규칙·손맛). 레퍼런스처럼 길이가 제각각.
const LEN = [1, 0.74, 0.93, 0.66, 1, 0.8, 0.86];
const ANG = [0, 0.07, -0.05, 0.05, -0.03, 0.06, -0.04];

function sparkPath(): string {
  const cx = 50;
  const cy = 50;
  const outer = 50;
  const inner = 50 * INNER;
  const total = SPIKES * 2;
  const step = (Math.PI * 2) / total;
  const start = -Math.PI / 2; // 위를 향해 시작
  let d = "";
  for (let i = 0; i < total; i++) {
    const isOuter = i % 2 === 0;
    const k = i >> 1;
    const r = isOuter ? outer * LEN[k % LEN.length] : inner;
    const a = start + step * i + (isOuter ? ANG[k % ANG.length] : 0);
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return d + "Z";
}

const STAR = sparkPath();

export default function Sparkle({
  size,
  top,
  left,
  right,
  bottom,
  phase = 0,
  fill,
  className,
}: SparkleProps) {
  const style = {
    width: size,
    height: size,
    top,
    left,
    right,
    bottom,
    animationDelay: `${-phase}s`,
    "--spark-fill": fill ?? "var(--sp-yellow)",
  } as CSSProperties;

  return (
    <span
      className={`${styles.sparkle} ${className ?? ""}`}
      style={style}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" overflow="visible">
        <path d={STAR} fill="var(--spark-fill)" />
      </svg>
    </span>
  );
}
