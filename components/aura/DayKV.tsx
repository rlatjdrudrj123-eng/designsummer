"use client";

/* ============================================================================
 * Aura DayKV — per-day KEY VISUAL accent for the Lineup day-intro header.
 * (forked from components/aura1/DayKV.tsx — independent of /aura1.)
 *
 * 둘 다 히어로와 동일한 Canvas2D HEAT-FIELD (저해상 버퍼 업스케일 = 자연 블러)로
 * 구현 — 그래서 둘 다 히어로처럼 마우스 오버 잔열(殘熱) 효과를 가진다.
 *
 *   Day 1 — SPHERE / 발산하는 아이디어: 외곽선 없이 부드럽게 퍼지는 원형 구체.
 *           열기가 응집되어 퍼져나가는 느낌.
 *   Day 2 — HEX RADIAL / 구축되는 실물: 육각형 실루엣 + 중심에서 6방향으로
 *           방사하는 열. 단단한 구축 + 발산을 함께.
 *
 * 두 그래픽 모두 Heatwave(오렌지/레드) 톤으로 통일.
 * prefers-reduced-motion: 단일 정적 프레임.
 * ========================================================================== */

import { useEffect, useRef } from "react";
import field from "@/content/heat-field.json";
import styles from "./DayKV.module.css";

const FREQ = field.freq;
const WARP_AMP = field.portrait.warp.amp;
const WARP_SEED = field.portrait.warp.seed;
const TRAIL_MS = 1000;
const TRAIL_MIN_DIST = 22;
const M = 0.16; // edge fade — keeps the field floating, not boxed
const TAU = Math.PI * 2;

/* ── value-noise / fbm (identical to develop ConceptHeat & HeatBlob) ── */
function rand2(ix: number, iy: number, seed: number) {
  let n = (ix * 73856093) ^ (iy * 19349663) ^ (seed * 83492791);
  n = (n << 13) ^ n;
  return (
    1 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824
  );
}
function vnoise(x: number, y: number, seed: number) {
  const x0 = Math.floor(x),
    y0 = Math.floor(y);
  const fx = x - x0,
    fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx),
    sy = fy * fy * (3 - 2 * fy);
  const n00 = rand2(x0, y0, seed),
    n10 = rand2(x0 + 1, y0, seed),
    n01 = rand2(x0, y0 + 1, seed),
    n11 = rand2(x0 + 1, y0 + 1, seed);
  const a = n00 + (n10 - n00) * sx,
    b = n01 + (n11 - n01) * sx;
  return a + (b - a) * sy;
}
function fbm(x: number, y: number, seed: number) {
  return vnoise(x, y, seed) * 0.667 + vnoise(x * 2, y * 2, seed + 101) * 0.333;
}

/* ── Per-day warm ramp (256 × RGBA). 둘 다 오렌지/레드 Heatwave 가족 —
   D1 은 살짝 더 레드, D2 는 살짝 더 오렌지로 형태만 구분. ── */
type Stop = { p: number; r: number; g: number; b: number; a: number };
const RAMP_D1: Stop[] = [
  { p: 0.0, r: 254, g: 244, b: 223, a: 0 },
  { p: 0.18, r: 255, g: 214, b: 150, a: 200 },
  { p: 0.45, r: 255, g: 122, b: 40, a: 255 },
  { p: 0.72, r: 255, g: 77, b: 0, a: 255 }, // --ds-red #ff4d00
  { p: 1.0, r: 224, g: 50, b: 0, a: 255 }, // --ds-red-deep #e03200
];
const RAMP_D2: Stop[] = [
  { p: 0.0, r: 254, g: 244, b: 223, a: 0 },
  { p: 0.18, r: 255, g: 202, b: 132, a: 200 },
  { p: 0.45, r: 255, g: 142, b: 48, a: 255 },
  { p: 0.72, r: 255, g: 92, b: 16, a: 255 },
  { p: 1.0, r: 214, g: 54, b: 0, a: 255 },
];
function buildLut(stops: Stop[]) {
  const lut = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let a = stops[0],
      b = stops[stops.length - 1];
    for (let k = 0; k < stops.length - 1; k++) {
      if (t >= stops[k].p && t <= stops[k + 1].p) {
        a = stops[k];
        b = stops[k + 1];
        break;
      }
    }
    const span = b.p - a.p || 1;
    const f = (t - a.p) / span;
    const o = i * 4;
    lut[o] = a.r + (b.r - a.r) * f;
    lut[o + 1] = a.g + (b.g - a.g) * f;
    lut[o + 2] = a.b + (b.b - a.b) * f;
    lut[o + 3] = a.a + (b.a - a.a) * f;
  }
  return lut;
}

export default function DayKV({
  day,
  className,
  background = false,
}: {
  day: 1 | 2;
  /** wrapper class override (기본 .kv 헤더 아이콘). 배경 블리드용으로 교체. */
  className?: string;
  /** 배경 블리드 모드 — 단일 정적 프레임(애니메이션·커서 잔열 없음, 가볍게). */
  background?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // 배경 모드는 정적 1프레임으로(reduced-motion 과 동일 취급) — 커서 잔열도 비활성.
    const reduce =
      background ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const LUT = buildLut(day === 1 ? RAMP_D1 : RAMP_D2);

    const buf = document.createElement("canvas");
    const bctx = buf.getContext("2d") as CanvasRenderingContext2D;

    let w = 0,
      h = 0,
      bw = 0,
      bh = 0,
      ar = 1;
    let img: ImageData | null = null;
    let warpX = new Float32Array(0);
    let warpY = new Float32Array(0);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      ar = w / h;
      canvas.width = Math.round(w);
      canvas.height = Math.round(h);
      bw = Math.max(48, Math.min(120, Math.round(w / 2)));
      bh = Math.max(1, Math.round(bw / ar));
      buf.width = bw;
      buf.height = bh;
      img = bctx.createImageData(bw, bh);
      warpX = new Float32Array(bw * bh);
      warpY = new Float32Array(bw * bh);
      // D2 도 KV 처럼 유기적인(흐릿·살짝 일렁이는) 가장자리가 되도록 워프를 충분히.
      const amp = day === 2 ? WARP_AMP * 0.62 : WARP_AMP;
      for (let y = 0; y < bh; y++) {
        const v = (y + 0.5) / bh;
        for (let x = 0; x < bw; x++) {
          const u = (x + 0.5) / bw;
          const i = y * bw + x;
          warpX[i] = u + amp * fbm(u * FREQ, v * FREQ, WARP_SEED);
          warpY[i] =
            v + amp * fbm(u * FREQ + 3.7, v * FREQ + 1.9, WARP_SEED + 777);
        }
      }
    };
    resize();
    window.addEventListener("resize", resize);

    // Cursor heat source (hero's 잔열 — residual decay trail). 양일 공통.
    type Cur = { x: number; y: number; t: number };
    const trail: Cur[] = [];
    let last: { x: number; y: number } | null = null;
    const onMove = (e: PointerEvent) => {
      if (reduce) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (px < 0 || py < 0 || px > w || py > h) {
        last = null;
        return;
      }
      const x = px / w;
      const y = py / h;
      if (!last || Math.hypot(x - last.x, y - last.y) > TRAIL_MIN_DIST / w) {
        trail.push({ x, y, t: performance.now() });
        if (trail.length > 24) trail.shift();
        last = { x, y };
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const start = performance.now();

    const render = (now: number) => {
      const t = now - start;
      const core = reduce ? 1 : 1 + 0.05 * Math.sin((t / 1700) * TAU);

      const rings: { R: number; st: number; sig: number }[] = [];
      if (day === 1) {
        // Day 1 — 부드러운 구체가 천천히 1~2겹 퍼져나간다(리플 약화 → 구체 강조).
        const NR = 2;
        for (let i = 0; i < NR; i++) {
          const phase = reduce ? (i + 0.5) / NR : (t / 4600 + i / NR) % 1;
          rings.push({
            R: 0.12 + phase * 0.34,
            st: 0.36 * (1 - phase) * (0.4 + phase),
            sig: 0.055,
          });
        }
      } else {
        // Day 2 — 동심 육각 링이 중심에서 바깥으로 계속 퍼져나간다(방사 + 다이내믹).
        // 각진 스포크가 아니라 겹겹이 확산하는 링이라 '별'로 안 보이고 '구축/전사' 느낌.
        const NR = 3;
        for (let i = 0; i < NR; i++) {
          const phase = reduce ? (i + 0.5) / NR : (t / 2400 + i / NR) % 1;
          rings.push({
            R: 0.05 + phase * 0.3,
            st: 0.5 * (1 - phase) * (0.45 + phase),
            sig: 0.03,
          });
        }
      }

      const lobes: { x: number; y: number; sig: number; st: number }[] = [];
      for (let i = trail.length - 1; i >= 0; i--) {
        const age = (now - trail[i].t) / TRAIL_MS;
        if (age >= 1) {
          trail.splice(i, 1);
          continue;
        }
        lobes.push({
          x: trail[i].x,
          y: trail[i].y,
          sig: 0.085,
          st: 0.55 * (1 - age),
        });
      }

      const data = img!.data;
      for (let p = 0; p < bw * bh; p++) {
        const ux = warpX[p];
        const uy = warpY[p];
        const dx = (ux - 0.5) * ar;
        const dy = uy - 0.5;
        const rr = Math.sqrt(dx * dx + dy * dy);

        const u = ((p % bw) + 0.5) / bw;
        const v = (((p / bw) | 0) + 0.5) / bh;
        // 직사각 윈도우 — 커서 잔열이 캔버스 전체에 자연히 번지도록(양일 공통).
        const rectWin =
          Math.min(1, u / M) *
          Math.min(1, (1 - u) / M) *
          Math.min(1, v / M) *
          Math.min(1, (1 - v) / M);

        // ── 그 날의 형태(form) ─────────────────────────────────────────────
        let dForm = 0;
        let formWin = rectWin;
        if (day === 1) {
          // 풍성하고 부드러운 구체 + 얇은 파동링.
          dForm = core * Math.exp(-(rr * rr) / (2 * 0.155 * 0.155));
          for (let k = 0; k < rings.length; k++) {
            const g = rings[k];
            const e = rr - g.R;
            dForm += g.st * Math.exp(-(e * e) / (2 * g.sig * g.sig));
          }
        } else {
          // 육각형 "거리"(iso-contour 가 육각형)로 부드럽게 식는 소프트 블롭 — 하드
          // 테두리 없이 KV 처럼 흐릿한 가장자리. 위에서 만든 동심 육각 링이 중심에서
          // 바깥으로 퍼져 방사+다이내믹을 만든다(각진 스포크 없음 → 별 아님).
          const ax = Math.abs(dx);
          const ay = Math.abs(dy);
          const hexM = Math.max(ay, 0.8660254 * ax + 0.5 * ay);
          // 소프트 육각 몸체(가우시안 → 흐릿한 가장자리) + 뜨거운 중심.
          dForm =
            core *
            (0.62 * Math.exp(-(hexM * hexM) / (2 * 0.15 * 0.15)) +
              0.42 * Math.exp(-(hexM * hexM) / (2 * 0.07 * 0.07)));
          // 동심 육각 링(중심→바깥 확산).
          for (let k = 0; k < rings.length; k++) {
            const g = rings[k];
            const e = hexM - g.R;
            dForm += core * g.st * Math.exp(-(e * e) / (2 * g.sig * g.sig));
          }
          // 하드 마스크 없음 — 캔버스 가장자리 페이드(rectWin)만 적용.
        }
        dForm *= formWin;

        // ── 커서 잔열(양일 공통, 직사각 윈도우로 전체 번짐) ──────────────────
        let dCur = 0;
        for (let k = 0; k < lobes.length; k++) {
          const s = lobes[k];
          const cx = (ux - s.x) * ar;
          const cy = uy - s.y;
          dCur += s.st * Math.exp(-(cx * cx + cy * cy) / (2 * s.sig * s.sig));
        }
        dCur *= rectWin;

        const d = dForm + dCur;
        const di = (d <= 0 ? 0 : d >= 1 ? 255 : (d * 255) | 0) * 4;
        const o = p * 4;
        data[o] = LUT[di];
        data[o + 1] = LUT[di + 1];
        data[o + 2] = LUT[di + 2];
        data[o + 3] = LUT[di + 3];
      }
      bctx.putImageData(img!, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, w, h);

      if (!reduce) raf = requestAnimationFrame(render);
    };

    if (reduce) render(start);
    else raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [day]);

  return (
    <div className={className ?? styles.kv}>
      <canvas
        ref={ref}
        className={styles.canvas}
        role={background ? undefined : "img"}
        aria-hidden={background ? true : undefined}
        aria-label={
          background
            ? undefined
            : day === 1
              ? "Day 1 컨셉: 발산하는 아이디어 — 부드럽게 퍼지는 열 구체"
              : "Day 2 컨셉: 구축되는 실물 — 중심에서 6방향으로 방사하는 육각 열"
        }
      />
    </div>
  );
}
