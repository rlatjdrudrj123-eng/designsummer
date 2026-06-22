"use client";

import { useEffect, useRef } from "react";
import field from "@/content/heat-field.json";
import { subtractiveRGBA } from "./processColor";
import styles from "./ConceptHeat.module.css";

/* [PROCESS 변형] D1/D2 컨셉 오브제.
   ★ 클라이언트 피드백(원본과 비슷한 형태 / 쨍하게 / 희끄무리 금지):
     - day 1 = "세 개의 큰 소프트 덩어리"(창백)를 폐기하고, 히어로처럼 원본
       heatmap 의 밀집 다중-소스 가우시안 필드를 복원한다(heat-field.json 의
       portrait sources + 드리프트 + 도메인 워프 + 커서 잔열). 소스를 큰 공간
       영역으로 묶어 C/M/Y 채널을 배정 → 큰 색 덩어리, 밀집 코어는 K(검정).
     - day 2 = 두 화살표 획(전사/인쇄 접점)에 C·M·Y 를 배정해 겹치면 K(검정).
     둘 다 흰 종이 위 CMYK 감산잉크. 격자·하프톤 없음. 풀채도(쨍). */

const FREQ = field.freq;
const WARP_AMP = field.portrait.warp.amp;
const WARP_SEED = field.portrait.warp.seed;
const TRAIL_MS = 1000;
const TRAIL_MIN_DIST = 22;
const M = 0.16;
const DRIFT = 0.012; // 소스 드리프트 진폭(정규화) — 원본과 동일

/* D1 밀집 필드: heat-field.json 의 portrait sources 를 큰 공간 영역으로 묶어
   C/M/Y 잉크 채널을 배정한다(좌→C, 중앙→M, 우→Y). 같은 채널 소스가 모여 큰
   색 덩어리를, 영역이 겹치는 곳은 보색, 밀집 코어는 K(검정)로 수렴. 음수(흰 만)
   소스는 세 채널 동일 차감으로 원본 형태를 그대로 깎는다. */
type Src = { x: number; y: number; r: number; s: number };
type InkSrc = Src & { ch: 0 | 1 | 2; cw: number };

function channelFor(x: number): 0 | 1 | 2 {
  if (x < 0.4) return 0;
  if (x < 0.62) return 1;
  return 2;
}
function toInk(sources: Src[]): InkSrc[] {
  const out: InkSrc[] = [];
  for (const s of sources) {
    if (s.s <= 0) {
      out.push({ ...s, ch: 0, cw: 1 });
      out.push({ ...s, ch: 1, cw: 1 });
      out.push({ ...s, ch: 2, cw: 1 });
      continue;
    }
    const ch = channelFor(s.x);
    out.push({ ...s, ch, cw: 1 });
    const dL = Math.abs(s.x - 0.4);
    const dR = Math.abs(s.x - 0.62);
    if (dL < 0.1 && ch !== 0) out.push({ ...s, ch: 0, cw: 0.55 });
    if (dL < 0.1 && ch !== 1) out.push({ ...s, ch: 1, cw: 0.55 });
    if (dR < 0.1 && ch !== 1) out.push({ ...s, ch: 1, cw: 0.55 });
    if (dR < 0.1 && ch !== 2) out.push({ ...s, ch: 2, cw: 0.55 });
  }
  return out;
}
const D1_INK = toInk(field.portrait.sources as Src[]);

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

const TAU = Math.PI * 2;

export default function ConceptHeat({ day = 1 }: { day?: 1 | 2 }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      bw = Math.max(90, Math.min(240, Math.round(w / 4)));
      bh = Math.max(1, Math.round(bw / ar));
      buf.width = bw;
      buf.height = bh;
      img = bctx.createImageData(bw, bh);
      warpX = new Float32Array(bw * bh);
      warpY = new Float32Array(bw * bh);
      const amp = day === 2 ? WARP_AMP * 0.4 : WARP_AMP;
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

    // 커서 잔열 — 원본 동일
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
        if (trail.length > 28) trail.shift();
        last = { x, y };
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const start = performance.now();

    type Lobe = { x: number; y: number; sig: number; st: number; ch: number };

    const frame = (now: number) => {
      const t = now - start;

      // 날짜별 시간 파라미터.
      let lobes: Lobe[] = [];
      // D1: 원본 밀집 다중-소스 가우시안 필드(heat-field.json) — 드리프트로
      //     천천히 흐른다. 소스는 영역별 C/M/Y 채널, 밀집 코어는 K.
      let d1Ink: InkSrc[] = [];
      if (day === 1) {
        d1Ink = D1_INK.map((s, k) => {
          if (reduce) return s;
          const per = 4200 + (k % 5) * 760;
          const ph = k * 0.7;
          return {
            x: s.x + DRIFT * Math.cos((t / per) * TAU + ph),
            y: s.y + DRIFT * Math.sin((t / per) * TAU + ph * 1.3),
            r: s.r,
            s: s.s,
            ch: s.ch,
            cw: s.cw,
          };
        });
      } else {
        // CMYK 감산: 두 화살표 획에 C/M/Y 를 깔아 겹침에서 K(검정) 발생
        const C = 0.5;
        const k = 0.7071;
        const pulse = reduce ? 0.5 : 0.5 + 0.5 * Math.sin((t / 1300) * TAU);
        const gap = 0.045 + 0.02 * pulse;
        const L = 0.26 + 0.07 * pulse;
        const head = 0.11;
        const SIG = 0.02;
        const ST = 0.95;

        const stroke = (
          x0: number,
          y0: number,
          x1: number,
          y1: number,
          steps: number,
          ch: number,
        ) => {
          for (let i = 0; i <= steps; i++) {
            const f = i / steps;
            lobes.push({
              x: x0 + (x1 - x0) * f,
              y: y0 + (y1 - y0) * f,
              sig: SIG,
              st: ST,
              ch,
            });
          }
        };

        // ↗ 화살표 (시안). ↙ 화살표 (마젠타). 두 획이 중앙에서 겹치는 부분 + 옐로 코어로 K.
        const tax = C + L * k,
          tay = C - L * k;
        stroke(C + gap * k, C - gap * k, tax, tay, 9, 0); // C 획
        stroke(tax, tay, tax - head, tay, 4, 0);
        stroke(tax, tay, tax, tay + head, 4, 0);

        const tbx = C - L * k,
          tby = C + L * k;
        stroke(C - gap * k, C + gap * k, tbx, tby, 9, 1); // M 획
        stroke(tbx, tby, tbx + head, tby, 4, 1);
        stroke(tbx, tby, tbx, tby - head, 4, 1);

        // 중앙 옐로 코어 — 세 잉크가 만나 K 로 (전사가 일어나는 접점)
        lobes.push({ x: C, y: C, sig: 0.05, st: 0.85, ch: 2 });
      }

      // 커서 소스 (잔열) — 채널은 순회
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
          ch: i % 3,
        });
      }
      const cursorLobes = day === 1 ? lobes.splice(0) : null;

      const data = img!.data;
      for (let p = 0; p < bw * bh; p++) {
        const ux = warpX[p];
        const uy = warpY[p];
        let c0 = 0,
          c1 = 0,
          c2 = 0;
        if (day === 1) {
          // 원본 밀집 다중-소스 필드 — 채널별 커버리지 누적(큰 색 덩어리, 코어 K).
          for (let k = 0; k < d1Ink.length; k++) {
            const g = d1Ink[k];
            const gdx = (ux - g.x) * ar;
            const gdy = uy - g.y;
            const v =
              g.cw * g.s * Math.exp(-(gdx * gdx + gdy * gdy) / (2 * g.r * g.r));
            if (g.ch === 0) c0 += v;
            else if (g.ch === 1) c1 += v;
            else c2 += v;
          }
          if (cursorLobes) {
            for (let k = 0; k < cursorLobes.length; k++) {
              const s = cursorLobes[k];
              const cx = (ux - s.x) * ar;
              const cy = uy - s.y;
              const v = s.st * Math.exp(-(cx * cx + cy * cy) / (2 * s.sig * s.sig));
              if (s.ch === 0) c0 += v;
              else if (s.ch === 1) c1 += v;
              else c2 += v;
            }
          }
        } else {
          for (let k = 0; k < lobes.length; k++) {
            const s = lobes[k];
            const cx = (ux - s.x) * ar;
            const cy = uy - s.y;
            const v = s.st * Math.exp(-(cx * cx + cy * cy) / (2 * s.sig * s.sig));
            if (s.ch === 0) c0 += v;
            else if (s.ch === 1) c1 += v;
            else c2 += v;
          }
        }

        const u = ((p % bw) + 0.5) / bw;
        const v = (((p / bw) | 0) + 0.5) / bh;
        const win =
          Math.min(1, u / M) *
          Math.min(1, (1 - u) / M) *
          Math.min(1, v / M) *
          Math.min(1, (1 - v) / M);
        c0 *= win;
        c1 *= win;
        c2 *= win;

        const o = p * 4;
        // 하프톤 격자 제거 — 커버리지를 그대로 부드럽게 합성 (heatmap 처럼 매끈).
        subtractiveRGBA(c0, c1, c2, data, o);
      }
      bctx.putImageData(img!, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // 바탕: 두 날 모두 흰 종이(잉크)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, w, h);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [day]);

  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />;
}
