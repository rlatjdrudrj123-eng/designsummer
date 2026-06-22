/* 히어로 열 필드 캘리브레이션 (빌드타임, 라이브러리 없음).
   kv.png 에 가우시안 필드(양수 열원 + 음수 흰 만)를 자동 피팅해 정지 상태를 구한다.
   - 색은 kv.png 픽셀에서 밀도→색 LUT 직접 추출
   - 소스 위치·반경·강도·워프를 MSE 최소화로 랜덤서치+힐클라임
   - 결과를 content/heat-field.json 으로 저장, 프리뷰 PNG 를 .review/ 에 출력
   실행: node scripts/calibrate-heat.mjs
*/
import { readFileSync, writeFileSync } from "node:fs";
import zlib from "node:zlib";

const KV = ".review/kv.png";
const OUT_JSON = "content/heat-field.json";

// ----- PNG 디코드 (colorType 2/6, 8bit, non-interlaced) --------------------
function decodePNG(buf) {
  let p = 8;
  let width = 0,
    height = 0,
    bitDepth = 0,
    colorType = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString("ascii", p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    p += 12 + len;
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6))
    throw new Error(`unsupported PNG ${bitDepth}/${colorType}`);
  const ch = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * ch;
  const out = Buffer.alloc(height * stride);
  const prev = Buffer.alloc(stride);
  const cur = Buffer.alloc(stride);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const f = raw[pos++];
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? cur[i - ch] : 0;
      const b = prev[i];
      const c = i >= ch ? prev[i - ch] : 0;
      let v = raw[pos + i];
      if (f === 1) v = (v + a) & 255;
      else if (f === 2) v = (v + b) & 255;
      else if (f === 3) v = (v + ((a + b) >> 1)) & 255;
      else if (f === 4) {
        const pa = Math.abs(b - c),
          pb = Math.abs(a - c),
          pc = Math.abs(a + b - 2 * c);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        v = (v + pr) & 255;
      }
      cur[i] = v;
    }
    pos += stride;
    cur.copy(out, y * stride);
    cur.copy(prev);
  }
  return { width, height, ch, data: out };
}

// ----- PNG 인코드 (RGBA, filter 0) -----------------------------------------
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function encodePNG(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(
      raw,
      y * (stride + 1) + 1,
    );
  }
  const idat = zlib.deflateSync(raw, { level: 6 });
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, "ascii");
    const body = Buffer.concat([t, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ----- 다운샘플 (박스 평균) ------------------------------------------------
function downsample(img, tw, th) {
  return downsampleCrop(img, tw, th, 0, 1, 0, 1);
}
// 소스의 부분 사각형 [x0f,x1f]×[y0f,y1f] 을 tw×th 로 박스 다운샘플
function downsampleCrop(img, tw, th, x0f, x1f, y0f, y1f) {
  const { width, height, ch, data } = img;
  const sx0 = x0f * width,
    sxr = (x1f - x0f) * width;
  const sy0 = y0f * height,
    syr = (y1f - y0f) * height;
  const out = new Float32Array(tw * th * 3);
  for (let ty = 0; ty < th; ty++) {
    const y0 = Math.floor(sy0 + (ty * syr) / th);
    const y1 = Math.max(y0 + 1, Math.floor(sy0 + ((ty + 1) * syr) / th));
    for (let tx = 0; tx < tw; tx++) {
      const x0 = Math.floor(sx0 + (tx * sxr) / tw);
      const x1 = Math.max(x0 + 1, Math.floor(sx0 + ((tx + 1) * sxr) / tw));
      let r = 0,
        g = 0,
        b = 0,
        n = 0;
      for (let y = y0; y < y1; y++) {
        let o = (y * width + x0) * ch;
        for (let x = x0; x < x1; x++) {
          r += data[o];
          g += data[o + 1];
          b += data[o + 2];
          o += ch;
          n++;
        }
      }
      const i = (ty * tw + tx) * 3;
      out[i] = r / n;
      out[i + 1] = g / n;
      out[i + 2] = b / n;
    }
  }
  return { w: tw, h: th, rgb: out };
}

// 열 스칼라: 흰=0, 검정(텍스트)=0, 옐로→오렌지→레드로 증가
const heatOf = (r, g, b) => (r / 255) * (1 - g / 255);

function heatGrid(down) {
  const { w, h, rgb } = down;
  const heat = new Float32Array(w * h);
  let max = 1e-6;
  for (let i = 0; i < w * h; i++) {
    const hv = heatOf(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]);
    heat[i] = hv;
    if (hv > max) max = hv;
  }
  for (let i = 0; i < heat.length; i++) heat[i] = Math.min(1, heat[i] / max);
  return { w, h, heat };
}

/* 밀도→색 LUT — kv.png 픽셀에서 직접 추출.
   - 무채색 제외: 채도(max-min)/max < 0.12 또는 어두운 픽셀(검정 타이포·QR·회색) 제거
   - 빈마다 평균이 아닌 중앙값 (outlier 오염 방지)
   - 저밀도(0~0.15) 구간은 sqrt 빈닝으로 조밀하게 (빈의 ~39% 할당)
   - 워름스(warmth) 단조 증가 강제 → 램프에 회색 딥 없음 */
function extractLUT(down) {
  const { w, h, rgb } = down;
  const N = 256;
  const SAT_MIN = 0.12;
  const isWarm = (r, g, b) => {
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    if (mx < 150) return false; // 어두운 픽셀(타이포) 제외
    if ((mx - mn) / mx < SAT_MIN) return false; // 무채색(흰·회색·검정·QR) 제외
    return r >= g && r > b; // 따뜻한 색만
  };
  let max = 1e-6;
  const hs = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = rgb[i * 3],
      g = rgb[i * 3 + 1],
      b = rgb[i * 3 + 2];
    const hv = isWarm(r, g, b) ? heatOf(r, g, b) : -1;
    hs[i] = hv;
    if (hv > max) max = hv;
  }
  // sqrt 빈닝: 밀도 0~0.15 가 빈 0~100 을 차지
  const binOf = (d) => Math.min(N - 1, Math.floor(Math.sqrt(d) * N));
  const bins = Array.from({ length: N }, () => [[], [], []]);
  for (let i = 0; i < w * h; i++) {
    if (hs[i] < 0) continue;
    const d = Math.min(0.9999, hs[i] / max);
    const k = binOf(d);
    bins[k][0].push(rgb[i * 3]);
    bins[k][1].push(rgb[i * 3 + 1]);
    bins[k][2].push(rgb[i * 3 + 2]);
  }
  const median = (a) => {
    a.sort((x, y) => x - y);
    return a[a.length >> 1];
  };
  const cols = new Array(N).fill(null);
  for (let k = 0; k < N; k++)
    if (bins[k][0].length >= 3)
      cols[k] = [median(bins[k][0]), median(bins[k][1]), median(bins[k][2])];
  // 빈 빈 선형 보간 (양끝은 최근접 유지)
  let prev = -1;
  for (let k = 0; k < N; k++) {
    if (!cols[k]) continue;
    if (prev < 0) for (let j = 0; j < k; j++) cols[j] = cols[k].slice();
    else if (k - prev > 1)
      for (let j = prev + 1; j < k; j++) {
        const t = (j - prev) / (k - prev);
        cols[j] = [0, 1, 2].map(
          (c) => cols[prev][c] + (cols[k][c] - cols[prev][c]) * t,
        );
      }
    prev = k;
  }
  if (prev < 0) throw new Error("no warm pixels for LUT");
  for (let k = prev + 1; k < N; k++) cols[k] = cols[prev].slice();
  // 워름스 단조 증가 강제: 내려가는 빈은 직전 색으로 hold (회색 딥 제거)
  for (let k = 1; k < N; k++) {
    const wPrev = heatOf(cols[k - 1][0], cols[k - 1][1], cols[k - 1][2]);
    const wCur = heatOf(cols[k][0], cols[k][1], cols[k][2]);
    if (wCur < wPrev) cols[k] = cols[k - 1].slice();
  }
  // 최종 LUT: 밀도 d(선형 256) → sqrt 빈 색 + 저밀도 알파 페이드(색이 아닌 알파로 흰에 전이)
  const lut = new Uint8ClampedArray(N * 4);
  for (let k = 0; k < N; k++) {
    const d = k / (N - 1);
    const c = cols[binOf(d)];
    lut[k * 4] = c[0];
    lut[k * 4 + 1] = c[1];
    lut[k * 4 + 2] = c[2];
    lut[k * 4 + 3] = Math.min(1, d / 0.05) * 255;
  }
  lut[3] = 0; // d=0 완전 투명
  return lut;
}

// ----- 시드 값 노이즈 (런타임과 동일하게 포팅) ------------------------------
function rand2(ix, iy, seed) {
  let n = (ix * 73856093) ^ (iy * 19349663) ^ (seed * 83492791);
  n = (n << 13) ^ n;
  return 1 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824;
}
function vnoise(x, y, seed) {
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
function fbm(x, y, seed) {
  return vnoise(x, y, seed) * 0.667 + vnoise(x * 2, y * 2, seed + 101) * 0.333;
}

const FREQ = 3.0;
// 필드 밀도 (정규화 좌표 u,v ∈ [0,1], AR=W/H 로 가우시안을 픽셀공간 원형 유지)
function density(u, v, srcs, warp, AR) {
  const ux =
    u + warp.amp * fbm(u * FREQ, v * FREQ, warp.seed);
  const vy =
    v + warp.amp * fbm(u * FREQ + 3.7, v * FREQ + 1.9, warp.seed + 777);
  let d = 0;
  for (let k = 0; k < srcs.length; k++) {
    const s = srcs[k];
    const dx = (ux - s.x) * AR;
    const dy = vy - s.y;
    d += s.s * Math.exp(-(dx * dx + dy * dy) / (2 * s.r * s.r));
  }
  return d < 0 ? 0 : d > 1 ? 1 : d;
}

// 목적함수 = MSE + (옵션) 순백 제약 페널티: 밀도 ≤ thresh 픽셀 비중이 minFrac 미만이면 벌점
function objective(srcs, warp, tgt, AR, pen) {
  const { w, h, heat } = tgt;
  let e = 0;
  let white = 0;
  for (let y = 0; y < h; y++) {
    const v = (y + 0.5) / h;
    for (let x = 0; x < w; x++) {
      const u = (x + 0.5) / w;
      const d = density(u, v, srcs, warp, AR);
      if (d <= (pen ? pen.thresh : 0)) white++;
      const diff = d - heat[y * w + x];
      e += diff * diff;
    }
  }
  let m = e / (w * h);
  if (pen) {
    const short = Math.max(0, pen.minFrac - white / (w * h));
    m += pen.weight * short * short;
  }
  return m;
}

// 결정적 의사난수 (피팅용)
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 시그마 하한: 전이 폭(옐로 대역) 확보. 음수 소스는 더 크게(가장자리 완화)
const R_MIN_POS = 0.09;
const R_MIN_NEG = 0.13;

function fit(tgt, AR, nPos, nNeg, label, pen = null) {
  const { w, h, heat } = tgt;
  const rnd = mulberry32(0x9e37 ^ Math.round(AR * 1000));
  // 초기화: 양수는 고열 픽셀, 음수는 구름 bbox 내 저열 픽셀
  const hot = [],
    cold = [];
  let minx = 1,
    maxx = 0,
    miny = 1,
    maxy = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const hv = heat[y * w + x];
      const u = (x + 0.5) / w,
        v = (y + 0.5) / h;
      if (hv > 0.45) {
        hot.push([u, v]);
        minx = Math.min(minx, u);
        maxx = Math.max(maxx, u);
        miny = Math.min(miny, v);
        maxy = Math.max(maxy, v);
      }
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const hv = heat[y * w + x];
      const u = (x + 0.5) / w,
        v = (y + 0.5) / h;
      if (hv < 0.15 && u > minx && u < maxx && v > miny && v < maxy)
        cold.push([u, v]);
    }
  const pick = (arr, fx, fy) =>
    arr.length ? arr[(rnd() * arr.length) | 0] : [fx, fy];
  let srcs = [];
  for (let i = 0; i < nPos; i++) {
    const [u, v] = pick(hot, 0.5, 0.25);
    srcs.push({ x: u, y: v, r: R_MIN_POS + 0.03 + rnd() * 0.08, s: 0.5 + rnd() * 0.3 });
  }
  for (let i = 0; i < nNeg; i++) {
    const [u, v] = pick(cold, 0.5, 0.25);
    srcs.push({ x: u, y: v, r: R_MIN_NEG + 0.02 + rnd() * 0.06, s: -(0.3 + rnd() * 0.3) });
  }
  let warp = { amp: 0.03, seed: 1 };

  // 워프 시드 후보 중 최적 선택 (초기)
  let best = { srcs: clone(srcs), warp: { ...warp }, e: Infinity };
  for (let seed = 1; seed <= 6; seed++) {
    const w2 = { amp: 0.03, seed };
    const e = objective(srcs, w2, tgt, AR, pen);
    if (e < best.e) best = { srcs: clone(srcs), warp: w2, e };
  }
  srcs = clone(best.srcs);
  warp = { ...best.warp };
  let cur = best.e;

  // 힐클라임 (스텝 감쇠 + 가끔 시드 점프)
  const ITERS = 24000;
  let step = 1;
  for (let it = 0; it < ITERS; it++) {
    step = 1 - it / ITERS; // 1 → 0
    const k = (rnd() * srcs.length) | 0;
    const which = rnd();
    const old = { ...srcs[k] };
    if (which < 0.3) srcs[k].x += (rnd() - 0.5) * 0.08 * step;
    else if (which < 0.6) srcs[k].y += (rnd() - 0.5) * 0.08 * step;
    else if (which < 0.8)
      srcs[k].r = clamp(
        srcs[k].r + (rnd() - 0.5) * 0.05 * step,
        srcs[k].s >= 0 ? R_MIN_POS : R_MIN_NEG,
        0.5,
      );
    else {
      const sgn = srcs[k].s >= 0 ? 1 : -1;
      srcs[k].s = clamp(
        srcs[k].s + (rnd() - 0.5) * 0.12 * step,
        sgn > 0 ? 0.05 : -1.3,
        sgn > 0 ? 1.3 : -0.03,
      );
    }
    let warpChanged = null;
    if (rnd() < 0.04) {
      warpChanged = { ...warp };
      if (rnd() < 0.5)
        warp.amp = clamp(warp.amp + (rnd() - 0.5) * 0.02 * step, 0, 0.09);
      else warp.seed = 1 + ((rnd() * 8) | 0);
    }
    const e = objective(srcs, warp, tgt, AR, pen);
    if (e < cur) {
      cur = e;
    } else {
      srcs[k] = old;
      if (warpChanged) warp = warpChanged;
    }
  }
  console.log(`  [${label}] fit MSE = ${cur.toFixed(5)} (${srcs.length} sources)`);
  return { srcs, warp, AR, mse: cur };
}

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const clone = (a) => a.map((s) => ({ ...s }));

// ----- 프리뷰 렌더 (필드를 직접 고해상으로 — 업스케일 점 노이즈 없음) -------
function renderPreview(fit, lut, w, h, scale = 3) {
  const W = w * scale,
    H = h * scale;
  const rgba = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) {
    const v = (y + 0.5) / H;
    for (let x = 0; x < W; x++) {
      const u = (x + 0.5) / W;
      const d = density(u, v, fit.srcs, fit.warp, fit.AR);
      const k = Math.min(255, (d * 255) | 0) * 4;
      const a = lut[k + 3] / 255;
      const i = (y * W + x) * 4;
      // 흰 바탕 위 합성
      rgba[i] = lut[k] * a + 255 * (1 - a);
      rgba[i + 1] = lut[k + 1] * a + 255 * (1 - a);
      rgba[i + 2] = lut[k + 2] * a + 255 * (1 - a);
      rgba[i + 3] = 255;
    }
  }
  return { rgba, W, H };
}

// ----- 메인 ---------------------------------------------------------------
console.log("decoding kv.png …");
const img = decodePNG(readFileSync(KV));
console.log(`  ${img.width}×${img.height}`);

// 색 LUT (충분한 따뜻한 픽셀)
const lutSrc = downsample(img, 220, Math.round((220 * img.height) / img.width));
const lut = extractLUT(lutSrc);

// 포트레이트 타깃 (KV 그대로) — 통과 조건 기준
const PW = 88;
const PH = Math.round((PW * img.height) / img.width); // ≈124
const pDown = downsample(img, PW, PH);
const pTarget = heatGrid(pDown);
const AR_p = PW / PH;

// 랜드스케이프 타깃 — KV 중앙 띠(구름 구간 18~58%)를 가로로 확장(AR 2.0 스트레치)한 크롭.
// 피팅 목적함수에 순백 제약(밀도 ≤0.05 픽셀 ≥45%)을 더해 하단 순백을 복원.
/* 랜드스케이프 타깃 — 가로 KV 가 없으므로 KV 에서 실측한 로브 기하를 가로 구도로
   재배치해 합성한다 (지정 구도: 좌상 큰 로브(좌측 잘림) · 가는 대각 허리 · 우중단
   둘째 로브 · 희미한 꼬리 · 하단 순백, 타이틀은 로브 B 하단에 겹침).
   ※ 크롭/세로압축 방식은 실패 기록: 띠 크롭은 구름 상단이 잘려 수평 띠가 되고,
     2× 세로 압축은 두 로브가 병합돼 덤벨 구조가 사라짐. */
const AR_l = 2.0;
const LW = 180;
const LH = Math.round(LW / AR_l); // 90
const LOBES = [
  { u: 0.02, v: 0.32, r: 0.26, s: 0.75 }, // 로브 A 좌측 연장 (화면 밖 잘림)
  { u: 0.17, v: 0.34, r: 0.3, s: 0.92 }, // 로브 A (좌상단)
  { u: 0.4, v: 0.42, r: 0.14, s: 0.42 }, // 허리 (가늘게)
  { u: 0.52, v: 0.45, r: 0.12, s: 0.38 },
  { u: 0.66, v: 0.48, r: 0.28, s: 0.92 }, // 로브 B (우중단)
  { u: 0.8, v: 0.42, r: 0.17, s: 0.5 }, // 로브 B 우측 어깨
  { u: 0.46, v: 0.62, r: 0.14, s: 0.18 }, // 꼬리 (희미한 옐로)
];
const lHeat = new Float32Array(LW * LH);
for (let y = 0; y < LH; y++) {
  const v = (y + 0.5) / LH;
  for (let x = 0; x < LW; x++) {
    const u = (x + 0.5) / LW;
    let d = 0;
    for (const L of LOBES) {
      const dx = (u - L.u) * AR_l;
      const dy = v - L.v;
      d += L.s * Math.exp(-(dx * dx + dy * dy) / (2 * L.r * L.r));
    }
    lHeat[y * LW + x] = Math.min(1, d);
  }
}
const lTarget = { w: LW, h: LH, heat: lHeat };
// 합성 타깃이 순백을 내장 → 페널티는 가드 (과한 가중치는 MSE 와 싸워 옐로 대역을 좁힘)
const WHITE_PEN = { thresh: 0.05, minFrac: 0.48, weight: 10.0 };

console.log("fitting portrait …");
const fitP = fit(pTarget, AR_p, 7, 3, "portrait");
console.log("fitting landscape …");
const fitL = fit(lTarget, AR_l, 8, 3, "landscape", WHITE_PEN); // 로브 2 + 허리 + 꼬리 → 8 열원

// ----- 검증 지표 -----------------------------------------------------------
// 하단 가장자리 전이 폭: 각 열에서 아래→위로 d 0.05 → 0.45 까지 픽셀 수 (옐로 대역 폭 프록시)
function edgeWidth(w, h, at) {
  const ws = [];
  for (let x = 0; x < w; x++) {
    let lo = -1;
    for (let y = h - 1; y >= 0; y--) {
      const d = at(x, y);
      if (lo < 0) {
        if (d >= 0.05) lo = y;
      } else if (d >= 0.45) {
        ws.push(lo - y);
        break;
      }
    }
  }
  ws.sort((a, b) => a - b);
  if (!ws.length) return null;
  return {
    n: ws.length,
    med: ws[(ws.length / 2) | 0],
    mean: +(ws.reduce((s, v) => s + v, 0) / ws.length).toFixed(2),
  };
}
const densAt = (f) => (x, y) =>
  density((x + 0.5) / (f.tgt.w), (y + 0.5) / f.tgt.h, f.srcs, f.warp, f.AR);
fitP.tgt = pTarget;
fitL.tgt = lTarget;
const ewKvP = edgeWidth(PW, PH, (x, y) => pTarget.heat[y * PW + x]);
const ewFitP = edgeWidth(PW, PH, densAt(fitP));
const ewKvL = edgeWidth(LW, LH, (x, y) => lTarget.heat[y * LW + x]);
const ewFitL = edgeWidth(LW, LH, densAt(fitL));
console.log(
  `edge width (portrait @${PW}px): KV med ${ewKvP?.med}px mean ${ewKvP?.mean}px · fit med ${ewFitP?.med}px mean ${ewFitP?.mean}px`,
);
console.log(
  `edge width (landscape @${LW}px): KV med ${ewKvL?.med}px mean ${ewKvL?.mean}px · fit med ${ewFitL?.med}px mean ${ewFitL?.mean}px`,
);
// 순백 비중 (landscape)
{
  let white = 0;
  for (let y = 0; y < LH; y++)
    for (let x = 0; x < LW; x++)
      if (densAt(fitL)(x, y) <= 0.05) white++;
  console.log(
    `landscape white fraction: ${((white / (LW * LH)) * 100).toFixed(1)}% (≥45% 요구)`,
  );
}

// 저장
const out = {
  note: "auto-fit to kv.png by scripts/calibrate-heat.mjs — do not hand-edit",
  freq: FREQ,
  lut: Array.from(lut),
  portrait: { aspect: AR_p, sources: fitP.srcs, warp: fitP.warp },
  landscape: { aspect: AR_l, sources: fitL.srcs, warp: fitL.warp },
};
writeFileSync(OUT_JSON, JSON.stringify(out));
console.log(`saved ${OUT_JSON}`);

// 프리뷰
{
  const p = renderPreview(fitP, lut, PW, PH, 3);
  writeFileSync(".review/fit-portrait.png", encodePNG(p.W, p.H, p.rgba));
  const l = renderPreview(fitL, lut, LW, LH, 3);
  writeFileSync(".review/fit-landscape.png", encodePNG(l.W, l.H, l.rgba));
}
console.log("saved previews → .review/fit-portrait.png, fit-landscape.png");
