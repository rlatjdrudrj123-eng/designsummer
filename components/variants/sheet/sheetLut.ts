/* SHEET 변형 전용 색상 LUT.
   레퍼런스 = 어두운 바닥 위 흰 종이 한 장이 프리즘 스펙트럼을 받아 굴절시키는 모습:
   흰 시트 위로 선명한(saturated) 무지개 스펙트럼이 부드럽게 번진다.
   원본 heat-field.json 의 cream→red 램프 대신, 코드로 생성한
   VIVID FULL-SPECTRUM 램프를 쓴다.
   밀도 t∈[0,1] → 흰 베이스 → 노랑 → 초록 → 시안 → 파랑 → 보라 → 빨강(hot).
   ★ 알파는 heatmap 과 동일하게 t≈0 에서 0, t≈0.55 까지 '넓고 부드럽게' 페이드인 —
     그래서 흰 종이가 자연스레 비치고 단단한 컬러 테두리 링이 생기지 않는다.
   ★ 필드의 밀도 수학·도메인 워프·드리프트·소스·커서 잔열·시그마·성능은
     원본(=heatmap 변형)과 100% 동일. 오직 이 색/알파 매핑만 다르다. */

type Stop = { t: number; r: number; g: number; b: number };

// white → yellow → green → cyan → blue → violet → red (a full refracted spectrum)
const STOPS: Stop[] = [
  { t: 0.0, r: 255, g: 255, b: 255 }, // 흰 베이스 (종이)
  { t: 0.12, r: 0xff, g: 0xe0, b: 0x2e }, // saturated yellow
  { t: 0.28, r: 0x35, g: 0xd0, b: 0x3a }, // vivid green
  { t: 0.44, r: 0x18, g: 0xc8, b: 0xe6 }, // cyan
  { t: 0.6, r: 0x0a, g: 0x46, b: 0xff }, // saturated blue
  { t: 0.78, r: 0x8a, g: 0x1e, b: 0xe6 }, // violet
  { t: 1.0, r: 0xff, g: 0x12, b: 0x2e }, // saturated red (hot)
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

/** 256엔트리 RGBA vivid full-spectrum LUT 생성 (heat-field.json 의 lut 를 대체). */
export function buildHeatmapLut(): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    const [r, g, b] = rampColor(t);
    // ★ heatmap 과 동일한 넓고 부드러운 알파 페이드 — 쿨(저밀도) 가장자리는 반투명하게
    //   '넓게' 페이드인되어 흰 종이로 자연스레 녹아든다(단단한 컬러 테두리 링 제거).
    //   선명한 스펙트럼 코어만 거의 불투명.
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
