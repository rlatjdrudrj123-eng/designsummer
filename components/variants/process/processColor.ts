/* PROCESS 변형 (CMYK 인쇄) 전용 색 합성 유틸.
   heatmap 변형이 단일 jet LUT 로 밀도 d 를 색으로 매핑했다면,
   PROCESS 는 "프로세스 컬러(인쇄 4원색 CMYK)" 자체를 주인공으로 삼는다.

   ★ 필드 엔진(가우시안 소스 + 도메인 워프 + 커서 잔열)은 heatmap/원본과 100% 동일.
     달라지는 것은 오직 "소스마다 잉크 채널을 갖고, 픽셀에서 채널별 커버리지를 합성하는 방식".

   - 전 사이트 = CMYK 감산(잉크/인쇄): 흰 종이 위 C·M·Y 잉크가 multiply 처럼 겹쳐
     점점 어두워지고 셋이 만나면 검정(K). + 하프톤 도트 스크린(인쇄 룩).
       잉크 커버리지 c,m,y ∈[0,1] →  white * (1-ink) ... 채널별:
       R = 255·(1-c),  G = 255·(1-m),  B = 255·(1-y)  를 잉크 순서대로 곱해 적용.
     흰 종이 위에 잉크를 "찍는" 것이므로 알파 = 잉크 총량(흰 종이는 비쳐야 함).

   ※ 가산(RGB)/screen/lighter 경로는 전부 제거됨 — 인쇄 잉크 컨셉만 남는다. */

/** 한 소스의 잉크 채널. 0=C(시안) 1=M(마젠타) 2=Y(옐로) */
export type Channel = 0 | 1 | 2;

/** 감산(CMYK) 결과를 RGBA 로 — 흰 종이 위 잉크.
   c,m,y 는 각 잉크 커버리지(0..∞→clamp). 흰 종이가 비치도록 알파는 잉크 총량.
   셋이 함께 진해지면 R=G=B→0, 즉 K(검정)로 수렴한다.

   ★ 쨍하게(클라이언트 피드백: 희끄무리 금지) — 풀채도 펀치:
     - 잉크 커버리지를 풀강도(1.0)로 살리고, 낮은 커버리지는 감마로 살짝 끌어올려
       (INK_GAMMA<1) "옅게 물든 우윳빛 종이"가 아니라 또렷한 색면이 되게 한다.
     - 코어에서 거의 불투명(248)까지 — C·M·Y 가 풀채도로 찍히고, 채널이 함께
       쌓이는 밀집 코어는 진한 K(검정)로 수렴.
     - 알파 페이드인 구간을 좁혀(0→0.32) 잉크가 빨리 또렷해지되 하드 링은 피한다.
     (격자·하프톤 없음 유지) */
// 잉크 커버리지 계수 — 풀강도 (소스 강도를 그대로 살림)
const INK_SOFT = 1.0;
// 잉크 농도 감마 (<1: 낮은 커버리지를 끌어올려 채도↑, 우윳빛 워시 제거)
const INK_GAMMA = 0.72;
// 최대 잉크 불투명도 (코어에서 거의 불투명, 풀채도 펀치)
const INK_MAX_A = 248;
export function subtractiveRGBA(
  c: number,
  m: number,
  y: number,
  out: Uint8ClampedArray,
  o: number,
) {
  // 감마로 농도를 끌어올린 뒤 clamp — 옅은 워시를 또렷한 색면으로.
  const C = c <= 0 ? 0 : c >= 1 ? 1 : Math.pow(c, INK_GAMMA);
  const M = m <= 0 ? 0 : m >= 1 ? 1 : Math.pow(m, INK_GAMMA);
  const Y = y <= 0 ? 0 : y >= 1 ? 1 : Math.pow(y, INK_GAMMA);
  // 감산: 흰 종이(255)에서 각 잉크가 보색을 빼낸다 (multiply 누적).
  //   C 잉크는 R 을, M 은 G 를, Y 는 B 를 흡수. 셋이 함께 진해지면 K(검정).
  const R = 255 * (1 - C * INK_SOFT);
  const G = 255 * (1 - M * INK_SOFT);
  const B = 255 * (1 - Y * INK_SOFT);
  const ink = C > M ? (C > Y ? C : Y) : M > Y ? M : Y;
  // 또렷한 알파 페이드인 (0→0.32) — 선명하고 쨍하게, 하드 링은 피함.
  const a = ink <= 0 ? 0 : smoothstep(0, 0.32, ink);
  out[o] = R | 0;
  out[o + 1] = G | 0;
  out[o + 2] = B | 0;
  out[o + 3] = (a * INK_MAX_A) | 0;
}

export function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/* --- 프로세스 컬러 토큰 (CSS 액센트용) -------------------------------------
   전 사이트 CMYK 감산혼합 잉크. DAY 1 = 시안 강조, DAY 2 = 마젠타 강조.
   값은 module css 의 .root 에서 스코프 오버라이드로 주입. */
export const PROCESS = {
  cmyk: { c: "#0093d0", m: "#ec008c", y: "#f5d800", k: "#0a0a0a" },
} as const;
