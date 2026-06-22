/* LIQUID 변형 전용 색상 LUT.
   원본 heat-field.json 의 cream→yellow→orange→red 램프 대신,
   글로시한 LIQUID-RAINBOW(액상 무지개) 서멀 램프를 코드로 생성한다.
   밀도 t∈[0,1] → 풀 스펙트럼을 부드럽게 도는 IRIDESCENT(오일-슬릭) 무지개:
     violet → blue → cyan → green → yellow → orange → red(hot).
   기름막/홀로그램처럼 매끄럽게 번지는 광택 시트(no banding, no contour dots).
   ★ heatmap 템플릿과 동일하게: 쿨(저밀도) 가장자리는 넓게 반투명 페이드인되어
     흰 바탕으로 자연스레 녹아든다(단단한 테두리 링·빨간 점 전부 제거).
   ★ 필드의 밀도 수학·도메인 워프·드리프트·소스·커서 잔열·시그마·성능은
     원본/heatmap 과 100% 동일. 오직 이 색/알파 매핑만 다르다.
   ★ 색은 FULL SATURATION 의 무지개 그대로 — 흰빛 혼합/리프트 없음(희끄무리 금지).
     heatmap 과의 구별은 색이 아니라 HeatBlob/ConceptHeat 의 표면(서피스) 효과로 만든다. */

type Stop = { t: number; r: number; g: number; b: number };

// IRIDESCENT 무지개 — 오일-슬릭/홀로그램 시트.
// 저밀도(가장자리) = 차가운 바이올렛/블루, 고밀도(코어) = 따뜻한 오렌지/레드.
// 부드럽게 이어지는 광택 — 날카로운 이음새 없음.
const STOPS: Stop[] = [
  { t: 0.0, r: 0x6a, g: 0x4f, b: 0xe6 }, // violet (cool edge)
  { t: 0.16, r: 0x3a, g: 0x6f, b: 0xf0 }, // blue
  { t: 0.34, r: 0x1f, g: 0xc6, b: 0xe0 }, // cyan
  { t: 0.52, r: 0x36, g: 0xd8, b: 0x9a }, // green-teal
  { t: 0.68, r: 0xb6, g: 0xe0, b: 0x3a }, // chartreuse
  { t: 0.82, r: 0xff, g: 0xc8, b: 0x22 }, // amber
  { t: 0.92, r: 0xff, g: 0x8a, b: 0x1e }, // orange
  { t: 1.0, r: 0xff, g: 0x3f, b: 0x2e }, // warm red (hot core)
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
      const f = smoothstep(a.t, b.t, t); // 밴드 내부는 매끄럽게 (광택 번짐)
      return [
        Math.round(a.r + (b.r - a.r) * f),
        Math.round(a.g + (b.g - a.g) * f),
        Math.round(a.b + (b.b - a.b) * f),
      ];
    }
  }
  return [STOPS[0].r, STOPS[0].g, STOPS[0].b];
}

/** 256엔트리 RGBA 액상 무지개 LUT 생성 (heat-field.json 의 lut 를 대체).
   ★ 글로시 오일-슬릭 시트 — 풀 채도의 선명한 무지개. 빨간 점·컨투어 라인 없음.
   ★ 알파는 heatmap 과 동일하게 넓게 페이드인 — 무열 가장자리가 흰 바탕에 녹아든다.
   ★ 색은 STOPS 의 포화 색 그대로 사용한다. 흰빛 리프트/혼합 없음 →
     희끄무리하게 바래지 않고 펀치 있는 무지개가 유지된다. */
export function buildLiquidLut(): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    const [r, g, b] = rampColor(t);
    // heatmap 과 동일한 부드럽고 넓은 페이드인(0→0.55) — 단단한 테두리 없음.
    const a = Math.round(235 * smoothstep(0, 0.55, t));
    const o = i * 4;
    lut[o] = r;
    lut[o + 1] = g;
    lut[o + 2] = b;
    lut[o + 3] = a;
  }
  return lut;
}

export const LIQUID_LUT = buildLiquidLut();
