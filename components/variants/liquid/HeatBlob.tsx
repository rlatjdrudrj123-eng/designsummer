"use client";

import { useEffect, useRef } from "react";
import field from "@/content/heat-field.json";
import { LIQUID_LUT } from "./liquidLut";
import styles from "./HeatBlob.module.css";

/* [LIQUID 변형] 히어로 열 필드 — 원본 components/hero/HeatBlob.tsx 의 정확한 클론.
   필드 = 가우시안 열원(양수) + 흰 만(음수)의 밀도 합 + 저주파 도메인 워프.
   파라미터는 content/heat-field.json (원본과 동일, 절대 수정 안 함).
   소스별 미세 드리프트 + 커서 소스(잔열)도 원본과 동일.
   ★ heatmap 과의 차이는 색이 아니라 "젖은 표면(WET SURFACE)" 텍스처다:
     1) LUT 는 풀 채도의 글로시 액상 무지개 — 흰빛 혼합 없음(색은 원본 그대로 선명).
     2) 픽셀 루프 안에서 흐르는 스페큘러 릴리프(specular relief)를 더한다.
        표면 위를 미끄러지는 광택 밴드: 밝은 띠는 그 자리 색을 "그 색의 하이라이트"로
        끌어올리고(채도 유지), 띠 사이 골은 살짝 어둡게(굴절·릴리프) — 곡면에 반사된
        빛처럼 읽혀 젖은 액체 표면이 된다. 흰색을 가산하지 않으므로 바래지 않는다.
   스페큘러는 저해상 버퍼/기존 루프에서 처리 → 픽셀당 추가비용 미미, 성능 유지.
   ★ heatmap 을 희게 만들던 ADDITIVE white bloom 패스는 제거(희끄무리 원인). */

type Src = { x: number; y: number; r: number; s: number };
type Cfg = { aspect: number; sources: Src[]; warp: { amp: number; seed: number } };

const FREQ = field.freq;
const LUT = LIQUID_LUT; // ← 원본: Uint8ClampedArray.from(field.lut)
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

      // 필드 계산 → LUT(+액상 시트/코스틱) → 버퍼
      const data = img!.data;
      const ns = srcs.length;
      // 흐르는 스페큘러 위상 — 표면 위를 천천히 미끄러지는 광택 띠.
      const ph1 = reduce ? 0 : (t / 5200) * 6.2832;
      const ph2 = reduce ? 0 : (t / 8100) * 6.2832;
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
        let r = LUT[di];
        let g = LUT[di + 1];
        let b = LUT[di + 2];
        const a = LUT[di + 3];
        if (a > 4) {
          // 젖은 표면 스페큘러 릴리프 — 흰빛 가산 대신, 그 픽셀의 "고유색"을
          // 밝게/어둡게 변조한다(채도 유지). 곡면에서 흐르는 광택 띠처럼 보인다.
          // wave∈[-1,1]: 밀도(코스틱) + 위치/시간(흐르는 스페큘러).
          const wave =
            Math.sin(d * 9.0 - ph1) * 0.5 +
            Math.sin((ux + uy) * 7.0 + ph2) * 0.5;
          // 밴드 마루(wave>0)는 색을 자기 하이라이트로 끌어올리고(곱 1.0→1.32),
          // 골(wave<0)은 살짝 어둡게(0.78→1.0) → 릴리프. a 로 코어일수록 강하게.
          const k = (a / 235) * 0.34;
          const m = 1 + wave * k; // 0.66 ~ 1.34 부근
          // 밝힐 때만 미세하게 채도 유지용 색쪽 가산(흰색 아님): 자기 색 비율로.
          r = r * m;
          g = g * m;
          b = b * m;
          r = r > 255 ? 255 : r < 0 ? 0 : r;
          g = g > 255 ? 255 : g < 0 ? 0 : g;
          b = b > 255 ? 255 : b < 0 ? 0 : b;
        }
        data[o] = r;
        data[o + 1] = g;
        data[o + 2] = b;
        data[o + 3] = a;
      }
      bctx.putImageData(img!, 0, 0);

      // 업스케일 드로우 (필드 영역 = 상단 fieldH, 그 아래 순백)
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, w, fieldH);

      // COLORED GLOSS GLOW — 흰빛 블룸 대신, 같은 버퍼를 약하게 블러해 "multiply"로
      // 겹친다. 자기 색으로 안쪽을 깊게 만들어 젖은 윤기/광택의 깊이를 준다.
      // multiply 라 흰빛이 섞이지 않으므로 바래지 않고 채도가 오히려 진해진다.
      // 알파를 낮게 유지해 형태/밝기는 보존(아주 옅은 톤). (버퍼 재드로우 1회, 저비용)
      const prevOp = ctx.globalCompositeOperation;
      const prevA = ctx.globalAlpha;
      const prevFilter = ctx.filter;
      ctx.globalCompositeOperation = "multiply";
      ctx.filter = `blur(${Math.max(4, w * 0.01)}px)`;
      ctx.globalAlpha = 0.22;
      ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, w, fieldH);
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
  }, []);

  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />;
}
