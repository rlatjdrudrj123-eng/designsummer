/* HEATMAP 변형 전용 색상 LUT.
   원본 heat-field.json 의 cream→yellow→orange→red 램프 대신,
   진짜 분석용(analytics) 히트맵 jet 램프를 코드로 생성한다.
   밀도 t∈[0,1] → 흰 베이스 → 파랑(cold) → 시안 → 초록 → 노랑 → 주황 → 빨강(hot).
   알파는 t≈0 에서 0, t≈0.18 에서 완전 불투명 — 그래서 흰 페이지가 비치고
   열 블롭/커서는 jet 색으로 단단히 찍힌다(white page 위 heatmap stamp 룩).
   ★ 필드의 밀도 수학·도메인 워프·드리프트·소스·커서 잔열·시그마·성능은
     원본과 100% 동일. 오직 이 색/알파 매핑만 다르다. */

type Stop = { t: number; r: number; g: number; b: number };

// white → blue → cyan → green → yellow → orange → red
const STOPS: Stop[] = [
  { t: 0.0, r: 255, g: 255, b: 255 }, // 흰 베이스 (페이지)
  { t: 0.12, r: 0x28, g: 0x50, b: 0xdc }, // blue (cold)
  { t: 0.3, r: 0x1e, g: 0xc2, b: 0xd2 }, // cyan
  { t: 0.5, r: 0x46, g: 0xc8, b: 0x5a }, // green
  { t: 0.68, r: 0xf5, g: 0xdc, b: 0x32 }, // yellow
  { t: 0.84, r: 0xf5, g: 0x8c, b: 0x1e }, // orange
  { t: 1.0, r: 0xe6, g: 0x28, b: 0x1e }, // red (hot)
];

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function rampColor(t: number): [number, number, number] {
  if (t <= STOPS[0].t) return [STOPS[0].r, STOPS[0].g, STOPS[0].b];
  if (t >= STOPS[STOPS.length - 1].t) {
    const e = STOPS[STOPS.length - 1];
    return [e.r, e.g, e.b];
  }
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i];
    const b = STOPS[i + 1];
    if (t >= a.t && t <= b.t) {
      const f = smoothstep(a.t, b.t, t);
      return [
        Math.round(a.r + (b.r - a.r) * f),
        Math.round(a.g + (b.g - a.g) * f),
        Math.round(a.b + (b.b - a.b) * f),
      ];
    }
  }
  return [STOPS[0].r, STOPS[0].g, STOPS[0].b];
}

/** 256엔트리 RGBA jet LUT 생성 (heat-field.json 의 lut 를 대체). */
export function buildHeatmapLut(): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    const [r, g, b] = rampColor(t);
    // 실제 어텐션 히트맵처럼 — 쿨(저밀도) 가장자리는 반투명하게 '넓게' 페이드인되어
    // 흰 바탕으로 자연스레 녹아든다(단단한 파란 테두리 링 제거). 뜨거운 코어만 불투명.
    const a = Math.round(235 * smoothstep(0, 0.55, t));
    const o = i * 4;
    lut[o] = r;
    lut[o + 1] = g;
    lut[o + 2] = b;
    lut[o + 3] = a;
  }
  return lut;
}

export const HEATMAP_LUT = buildHeatmapLut();
