"use client";

import { useEffect, useRef } from "react";
import field from "@/content/heat-field.json";
import { subtractiveRGBA } from "./processColor";
import styles from "./HeatBlob.module.css";

/* [PROCESS 변형] 히어로 프로세스-컬러 필드 — 원본/heatmap 의 "밀집 유기 필드"를
   그대로 쓰되, 색만 CMYK 감산잉크로 렌더한다.
   ─────────────────────────────────────────────────────────────────────────
   ★ 클라이언트 피드백(원본과 비슷한 형태 / 쨍하게 / 희끄무리 금지):
     - "세 개의 큰 소프트 가우시안 덩어리"(희끄무리·창백)를 폐기.
     - heatmap 변형(=원본)과 동일한 밀집 다중-소스 가우시안 필드를 복원한다:
       content/heat-field.json 의 sources(양수 열원 + 음수 흰 만) + 드리프트
       + 저주파 도메인 워프 + 커서 잔열. → 밀집·유기·펀치 있는 원본 형태.

   색 모델(= 원본과 다른 유일한 부분, "덩어리감"은 유지):
     - 알록달록 작은 무지개 스페클을 피하려고, "픽셀마다 잉크를 잘게 섞지" 않는다.
     - 대신 소스를 큰 공간 영역으로 묶어 채널을 배정한다(좌→C, 중앙→M, 우→Y).
       같은 채널 소스들이 모여 큰 C / M / Y 잉크 덩어리를 이루고, 영역이 겹치는
       곳에서 두 채널이 쌓여 보색(C+M=파랑, M+Y=빨강, C+Y=초록), 가장 밀집한
       코어는 세 채널이 모두 쌓여 진한 K(검정)로 수렴한다.
     - 채널 커버리지는 풀강도로 누적 → 코어에서 풀채도 펀치(쨍). 옅은 워시 금지.
   픽셀 합성: processColor.subtractiveRGBA — 흰 종이 × (1−잉크) 채널별 곱.
   격자/하프톤/가로세로 라인 없음. 부드러운 에어브러시 가장자리만. */

type Src = { x: number; y: number; r: number; s: number };
type Cfg = {
  aspect: number;
  sources: Src[];
  warp: { amp: number; seed: number };
};

const FREQ = field.freq;
const TRAIL_MS = 1100;
const TRAIL_MIN_DIST = 26;
const DRIFT = 0.012; // 소스 드리프트 진폭 (정규화) — 원본과 동일

/* 소스를 큰 공간 영역으로 묶어 잉크 채널을 배정한다(덩어리감).
   좌측대 = C, 중앙대 = M, 우측대 = Y. 양수 소스만 잉크가 됨(음수=흰 만은
   필드 형태를 깎는 역할 그대로). 경계 부근 소스는 두 채널에 나눠 배정해
   영역 사이가 자연스럽게 보색으로 물들게 한다. */
type InkSrc = Src & { ch: 0 | 1 | 2; w: number };

function channelFor(x: number): 0 | 1 | 2 {
  // 좌(0..0.4)=C, 중(0.4..0.62)=M, 우(0.62..1)=Y
  if (x < 0.4) return 0;
  if (x < 0.62) return 1;
  return 2;
}

/* 소스 배열 → 잉크 소스 배열. 양수 소스는 영역 채널로, 경계 근처는 인접
   채널로도 약하게 복제해 큰 영역끼리 부드럽게 겹치게(보색 전이). */
function toInk(sources: Src[]): InkSrc[] {
  const out: InkSrc[] = [];
  for (const s of sources) {
    if (s.s <= 0) {
      // 음수(흰 만) — 모든 채널을 동일하게 깎아야 형태가 원본처럼 유지된다.
      out.push({ ...s, ch: 0, w: 1 });
      out.push({ ...s, ch: 1, w: 1 });
      out.push({ ...s, ch: 2, w: 1 });
      continue;
    }
    const ch = channelFor(s.x);
    out.push({ ...s, ch, w: 1 });
    // 영역 경계 부근이면 인접 채널에도 약하게 — 큰 덩어리 사이 보색 전이.
    const dL = Math.abs(s.x - 0.4);
    const dR = Math.abs(s.x - 0.62);
    if (dL < 0.1 && ch !== 0) out.push({ ...s, ch: 0, w: 0.55 });
    if (dL < 0.1 && ch !== 1) out.push({ ...s, ch: 1, w: 0.55 });
    if (dR < 0.1 && ch !== 1) out.push({ ...s, ch: 1, w: 0.55 });
    if (dR < 0.1 && ch !== 2) out.push({ ...s, ch: 2, w: 0.55 });
  }
  return out;
}

// 시드 노이즈 (도메인 워프용 — 유기적 가장자리, 원본과 동일)
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
    let fieldH = 0;
    let cfg: Cfg = field.landscape as Cfg;
    let ink: InkSrc[] = toInk((field.landscape as Cfg).sources);
    let img: ImageData | null = null;
    let warpX: Float32Array = new Float32Array(0);
    let warpY: Float32Array = new Float32Array(0);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w);
      canvas.height = Math.round(h);

      cfg = (w <= 640 || h > w ? field.portrait : field.landscape) as Cfg;
      ink = toInk(cfg.sources);
      fieldH = w / cfg.aspect;

      // 저해상 버퍼 — 폭 비례 업스케일 (매끈함). 원본과 동일.
      bw = Math.max(80, Math.min(220, Math.round(w / 7)));
      bh = Math.max(1, Math.round(bw / cfg.aspect));
      buf.width = bw;
      buf.height = bh;
      img = bctx.createImageData(bw, bh);

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

    // 커서 소스 (잔열) — 흰 종이 위 잉크를 찍는다(C/M/Y 순회 → 겹치면 K).
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
      const x = px / w;
      const y = py / fieldH;
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
      const ar = cfg.aspect;

      // 드리프트 적용한 현재 잉크 소스 — 원본 드리프트 수학과 동일.
      const srcs: InkSrc[] = ink.map((s, k) => {
        if (reduce) return s;
        const per = 4200 + (k % 5) * 760;
        const ph = k * 0.7;
        return {
          x: s.x + DRIFT * Math.cos((t / per) * 6.2832 + ph),
          y: s.y + DRIFT * Math.sin((t / per) * 6.2832 + ph * 1.3),
          r: s.r,
          s: s.s,
          ch: s.ch,
          w: s.w,
        };
      });

      // 커서 잉크점 — 자체 잉크점(채널 순회 → 겹치면 K), 잔열 감쇠.
      for (let i = trail.length - 1; i >= 0; i--) {
        const age = (now - trail[i].t) / TRAIL_MS;
        if (age >= 1) {
          trail.splice(i, 1);
          continue;
        }
        srcs.push({
          x: trail[i].x,
          y: trail[i].y,
          r: 0.09,
          s: 0.85 * (1 - age),
          ch: (i % 3) as 0 | 1 | 2,
          w: 1,
        });
      }

      // 픽셀 루프: 채널별 커버리지를 누적(밀집 다중-소스) → CMYK 감산.
      const data = img!.data;
      const ns = srcs.length;
      for (let p = 0; p < bw * bh; p++) {
        const ux = warpX[p];
        const uy = warpY[p];
        let c0 = 0,
          c1 = 0,
          c2 = 0;
        for (let k = 0; k < ns; k++) {
          const s = srcs[k];
          const dx = (ux - s.x) * ar;
          const dy = uy - s.y;
          const g =
            s.w * s.s * Math.exp(-(dx * dx + dy * dy) / (2 * s.r * s.r));
          // 음수(흰 만)는 세 채널 동일 차감 — 형태가 원본처럼 깎인다.
          if (s.ch === 0) c0 += g;
          else if (s.ch === 1) c1 += g;
          else c2 += g;
        }

        const o = p * 4;
        // 격자/하프톤 없이 매끈하게 합성 (흰 종이 위 CMYK 감산잉크).
        subtractiveRGBA(c0, c1, c2, data, o);
      }
      bctx.putImageData(img!, 0, 0);

      ctx.clearRect(0, 0, w, h);
      // 흰 종이 한 장 — 전 화면 CMYK-on-white
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, fieldH);

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
