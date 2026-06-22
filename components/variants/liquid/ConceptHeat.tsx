"use client";

import { useEffect, useRef } from "react";
import field from "@/content/heat-field.json";
import { LIQUID_LUT } from "./liquidLut";
import styles from "./ConceptHeat.module.css";

/* [LIQUID 변형] D1/D2 컨셉 열 오브제 — 원본 components/sections/ConceptHeat.tsx 의
   정확한 클론. 밀도 수학·도메인 워프·D1 동심원 파동·D2 화살표 확장·커서 잔열 모두 동일.
   ★ heatmap 과의 차이는 색이 아니라 "젖은 표면(WET SURFACE)" 텍스처다:
     1) LUT 는 풀 채도의 글로시 액상 무지개 — 흰빛 혼합 없음(색은 원본 그대로 선명).
     2) 픽셀 루프 안의 흐르는 스페큘러 릴리프 — 광택 밴드가 그 자리 색을 자기
        하이라이트로 끌어올리고 골은 살짝 어둡게(곡면 반사). 흰빛 가산 없음 → 안 바램.
     3) 업스케일 후 옅은 multiply 광택 글로우(자기 색)로 젖은 깊이를 준다.
   ★ heatmap 을 희게 만들던 ADDITIVE white bloom 패스 제거(희끄무리 원인).
   surface 효과 모두 저해상 버퍼/기존 루프에서 처리 → 성능 영향 미미. */

const FREQ = field.freq;
const LUT = LIQUID_LUT; // ← 원본: Uint8ClampedArray.from(field.lut)
const WARP_AMP = field.portrait.warp.amp; // 가장자리만 살짝 일렁임 (형태는 또렷이)
const WARP_SEED = field.portrait.warp.seed;
const TRAIL_MS = 1000;
const TRAIL_MIN_DIST = 22;
const M = 0.16; // 가장자리 페이드 — 박스에 갇히지 않고 떠 있게

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
      // D2 화살표는 형태가 또렷해야 하므로 워프를 약하게(가장자리만 살짝 일렁)
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

    // 커서 열원 (히어로와 동일한 잔열)
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

    const frame = (now: number) => {
      const t = now - start;

      // 날짜별 시간 파라미터
      let core = 1;
      const rings: { R: number; st: number; sig: number; cx: number; cy: number }[] = [];
      let lobes: { x: number; y: number; sig: number; st: number }[] = [];
      if (day === 1) {
        core = reduce ? 1 : 1 + 0.06 * Math.sin((t / 1500) * TAU);
        const NR = 3;
        for (let i = 0; i < NR; i++) {
          const phase = reduce ? (i + 0.5) / NR : ((t / 4200) + i / NR) % 1;
          rings.push({
            R: 0.1 + phase * 0.4, // 코어에서 바깥으로
            st: 0.6 * (1 - phase) * (0.4 + phase), // 퍼지며 페이드
            sig: 0.045,
            cx: 0.5,
            cy: 0.5,
          });
        }
      } else {
        // 전사(HEAT TRANSFER) = 확장. 중심에서 양 대각으로 뻗는 두 화살표(↗·↙).
        // 한쪽으로 흐르지 않고 바깥으로 동시에 벌어진다(진짜 확장). 파동(링) 없음.
        const C = 0.5;
        const k = 0.7071; // 대각 단위
        const pulse = reduce ? 0.5 : 0.5 + 0.5 * Math.sin((t / 1300) * TAU);
        const gap = 0.045 + 0.02 * pulse; // 중앙 빈 공간 — 확장하며 벌어짐
        const L = 0.26 + 0.07 * pulse; // 화살표 길이 — 바깥으로 신축
        const head = 0.11; // 화살촉 길이
        const SIG = 0.02;
        const ST = 0.85;

        // 한 직선 위에 열 점을 깔아 "획"을 만든다
        const stroke = (
          x0: number,
          y0: number,
          x1: number,
          y1: number,
          steps: number,
        ) => {
          for (let i = 0; i <= steps; i++) {
            const f = i / steps;
            lobes.push({
              x: x0 + (x1 - x0) * f,
              y: y0 + (y1 - y0) * f,
              sig: SIG,
              st: ST,
            });
          }
        };

        // ↗ 화살표 (우상). 촉은 직각 코너(좌·하로 꺾임)
        const tax = C + L * k,
          tay = C - L * k;
        stroke(C + gap * k, C - gap * k, tax, tay, 9); // 획
        stroke(tax, tay, tax - head, tay, 4); // 촉 ─ (왼쪽)
        stroke(tax, tay, tax, tay + head, 4); // 촉 │ (아래)

        // ↙ 화살표 (좌하). 촉은 직각 코너(우·상으로 꺾임)
        const tbx = C - L * k,
          tby = C + L * k;
        stroke(C - gap * k, C + gap * k, tbx, tby, 9); // 획
        stroke(tbx, tby, tbx + head, tby, 4); // 촉 ─ (오른쪽)
        stroke(tbx, tby, tbx, tby - head, 4); // 촉 │ (위)
      }

      // 커서 소스
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
      // D1 에서도 커서를 lobes 로 추가 처리하기 위해 분리 보관
      const cursorLobes = day === 1 ? lobes.splice(0) : null;

      const data = img!.data;
      // 흐르는 스페큘러 위상 (HeatBlob 과 동일 개념)
      const ph1 = reduce ? 0 : (t / 5200) * 6.2832;
      const ph2 = reduce ? 0 : (t / 8100) * 6.2832;
      for (let p = 0; p < bw * bh; p++) {
        const ux = warpX[p];
        const uy = warpY[p];
        let d = 0;
        if (day === 1) {
          const dx = (ux - 0.5) * ar;
          const dy = uy - 0.5;
          const rr = Math.sqrt(dx * dx + dy * dy);
          d = core * Math.exp(-(rr * rr) / (2 * 0.13 * 0.13)); // 코어
          for (let k = 0; k < rings.length; k++) {
            const g = rings[k];
            const gdx = (ux - g.cx) * ar;
            const gdy = uy - g.cy;
            const e = Math.sqrt(gdx * gdx + gdy * gdy) - g.R;
            d += g.st * Math.exp(-(e * e) / (2 * g.sig * g.sig));
          }
          if (cursorLobes) {
            for (let k = 0; k < cursorLobes.length; k++) {
              const s = cursorLobes[k];
              const cx = (ux - s.x) * ar;
              const cy = uy - s.y;
              d += s.st * Math.exp(-(cx * cx + cy * cy) / (2 * s.sig * s.sig));
            }
          }
        } else {
          for (let k = 0; k < lobes.length; k++) {
            const s = lobes[k];
            const cx = (ux - s.x) * ar;
            const cy = uy - s.y;
            d += s.st * Math.exp(-(cx * cx + cy * cy) / (2 * s.sig * s.sig));
          }
          // 접촉 파동 (타겟 중심 방사 링)
          for (let k = 0; k < rings.length; k++) {
            const g = rings[k];
            const gdx = (ux - g.cx) * ar;
            const gdy = uy - g.cy;
            const e = Math.sqrt(gdx * gdx + gdy * gdy) - g.R;
            d += g.st * Math.exp(-(e * e) / (2 * g.sig * g.sig));
          }
        }

        const u = ((p % bw) + 0.5) / bw;
        const v = (((p / bw) | 0) + 0.5) / bh;
        const win =
          Math.min(1, u / M) *
          Math.min(1, (1 - u) / M) *
          Math.min(1, v / M) *
          Math.min(1, (1 - v) / M);
        d *= win;

        const di = (d <= 0 ? 0 : d >= 1 ? 255 : (d * 255) | 0) * 4;
        const o = p * 4;
        let cr = LUT[di];
        let cg = LUT[di + 1];
        let cb = LUT[di + 2];
        const ca = LUT[di + 3];
        if (ca > 4) {
          // 젖은 표면 스페큘러 릴리프 — 흰빛 가산 대신 그 픽셀 고유색을 변조(채도 유지).
          const wave =
            Math.sin(d * 9.0 - ph1) * 0.5 +
            Math.sin((ux + uy) * 7.0 + ph2) * 0.5;
          const k = (ca / 235) * 0.34;
          const m = 1 + wave * k; // 마루=밝게, 골=어둡게 → 곡면 반사 릴리프
          cr = cr * m;
          cg = cg * m;
          cb = cb * m;
          cr = cr > 255 ? 255 : cr < 0 ? 0 : cr;
          cg = cg > 255 ? 255 : cg < 0 ? 0 : cg;
          cb = cb > 255 ? 255 : cb < 0 ? 0 : cb;
        }
        data[o] = cr;
        data[o + 1] = cg;
        data[o + 2] = cb;
        data[o + 3] = ca;
      }
      bctx.putImageData(img!, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, w, h);

      // COLORED GLOSS GLOW — 흰빛 블룸 대신 옅은 multiply 로 자기 색을 겹쳐
      // 젖은 윤기/깊이를 준다(흰빛 미혼합 → 안 바램, 채도 유지). 저비용 1회.
      const prevOp = ctx.globalCompositeOperation;
      const prevA = ctx.globalAlpha;
      const prevFilter = ctx.filter;
      ctx.globalCompositeOperation = "multiply";
      ctx.filter = `blur(${Math.max(4, w * 0.012)}px)`;
      ctx.globalAlpha = 0.22;
      ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, w, h);
      ctx.globalCompositeOperation = prevOp;
      ctx.globalAlpha = prevA;
      ctx.filter = prevFilter;
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
