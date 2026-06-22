"use client";

import { useEffect, useRef } from "react";
import field from "@/content/heat-field.json";
import { HEATMAP_LUT } from "./heatmapLut";
import styles from "./HeatBlob.module.css";

/* [HEATMAP 변형] 히어로 열 필드 — 원본 components/hero/HeatBlob.tsx 의 정확한 클론.
   필드 = 가우시안 열원(양수) + 흰 만(음수)의 밀도 합 + 저주파 도메인 워프.
   파라미터는 content/heat-field.json (원본과 동일, 절대 수정 안 함).
   소스별 미세 드리프트 + 커서 소스(잔열)도 원본과 동일.
   ★ 유일한 차이: LUT 가 원본 cream→red 램프 대신 진짜 jet 히트맵(흰 베이스→blue→red). */

type Src = { x: number; y: number; r: number; s: number };
type Cfg = { aspect: number; sources: Src[]; warp: { amp: number; seed: number } };

const FREQ = field.freq;
const LUT = HEATMAP_LUT; // ← 원본: Uint8ClampedArray.from(field.lut)
const TRAIL_MS = 1100;
const TRAIL_MIN_DIST = 26;
const DRIFT = 0.012; // 소스 드리프트 진폭 (정규화)

// 시드 값 노이즈 (calibrate-heat.mjs 와 동일)
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

export default function HeatBlob() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const buf = document.createElement("canvas");
    const bctx = buf.getContext("2d") as CanvasRenderingContext2D;

    let w = 0,
      h = 0;
    let bw = 0,
      bh = 0;
    let fieldH = 0; // 필드가 차지하는 캔버스 높이(px)
    let cfg: Cfg = field.landscape as Cfg;
    let img: ImageData | null = null;
    let warpX: Float32Array = new Float32Array(0); // 픽셀별 워프된 u
    let warpY: Float32Array = new Float32Array(0);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w);
      canvas.height = Math.round(h);

      cfg = (w <= 640 || h > w ? field.portrait : field.landscape) as Cfg;
      fieldH = w / cfg.aspect;

      // 저해상 버퍼 — 폭 비례로 업스케일 비율 일정 (매끈함)
      bw = Math.max(80, Math.min(220, Math.round(w / 7)));
      bh = Math.max(1, Math.round(bw / cfg.aspect));
      buf.width = bw;
      buf.height = bh;
      img = bctx.createImageData(bw, bh);

      // 워프 그리드 정적 → 1회 계산
      warpX = new Float32Array(bw * bh);
      warpY = new Float32Array(bw * bh);
      const { amp, seed } = cfg.warp;
      for (let y = 0; y < bh; y++) {
        const v = (y + 0.5) / bh;
        for (let x = 0; x < bw; x++) {
          const u = (x + 0.5) / bw;
          const i = y * bw + x;
          warpX[i] = u + amp * fbm(u * FREQ, v * FREQ, seed);
          warpY[i] = v + amp * fbm(u * FREQ + 3.7, v * FREQ + 1.9, seed + 777);
        }
      }
    };
    resize();
    window.addEventListener("resize", resize);

    // 커서 소스 (find your heatmap)
    type Cur = { x: number; y: number; t: number };
    const trail: Cur[] = [];
    let last: { x: number; y: number } | null = null;
    const onMove = (e: PointerEvent) => {
      if (reduce) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (px < 0 || py < 0 || px > w || py > fieldH) {
        last = null;
        return;
      }
      const x = px / w; // 필드 정규화 (가로 0..1)
      const y = py / fieldH; // 세로 0..1 (필드 영역 기준)
      if (!last || Math.hypot(x - last.x, y - last.y) > TRAIL_MIN_DIST / w) {
        trail.push({ x, y, t: performance.now() });
        if (trail.length > 36) trail.shift();
        last = { x, y };
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const start = performance.now();

    const frame = (now: number) => {
      const t = now - start;
      const base = cfg.sources;
      const ar = cfg.aspect;

      // 드리프트 적용한 현재 소스
      const srcs: Src[] = base.map((s, k) => {
        if (reduce) return s;
        const per = 4200 + (k % 5) * 760;
        const ph = k * 0.7;
        return {
          x: s.x + DRIFT * Math.cos((t / per) * 6.2832 + ph),
          y: s.y + DRIFT * Math.sin((t / per) * 6.2832 + ph * 1.3),
          r: s.r,
          s: s.s,
        };
      });

      // 커서 소스 추가 (잔열 = 감쇠)
      for (let i = trail.length - 1; i >= 0; i--) {
        const age = (now - trail[i].t) / TRAIL_MS;
        if (age >= 1) {
          trail.splice(i, 1);
          continue;
        }
        // 반경은 캘리브레이션 시그마 하한(0.09)과 동일 — 주변 열과 같은 전이 폭으로 합쳐짐
        srcs.push({ x: trail[i].x, y: trail[i].y, r: 0.09, s: 0.55 * (1 - age) });
      }

      // 필드 계산 → LUT → 버퍼
      const data = img!.data;
      const ns = srcs.length;
      for (let p = 0; p < bw * bh; p++) {
        const ux = warpX[p];
        const uy = warpY[p];
        let d = 0;
        for (let k = 0; k < ns; k++) {
          const s = srcs[k];
          const dx = (ux - s.x) * ar;
          const dy = uy - s.y;
          d += s.s * Math.exp(-(dx * dx + dy * dy) / (2 * s.r * s.r));
        }
        const di = (d <= 0 ? 0 : d >= 1 ? 255 : (d * 255) | 0) * 4;
        const o = p * 4;
        data[o] = LUT[di];
        data[o + 1] = LUT[di + 1];
        data[o + 2] = LUT[di + 2];
        data[o + 3] = LUT[di + 3];
      }
      bctx.putImageData(img!, 0, 0);

      // 업스케일 드로우 (필드 영역 = 상단 fieldH, 그 아래 순백)
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, w, fieldH);

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />;
}
