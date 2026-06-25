/* ============================================================================
 * `/r/og?a={animalId}` — 동적 OG 이미지(1200×630). 카톡/트위터 미리보기 카드.
 *
 * next/og(ImageResponse, Satori 기반) 로 결과 카드를 SVG→PNG 로 렌더한다. 한글이
 * 깨지지 않도록 Pretendard(Regular/Bold) OTF 를 jsDelivr 에서 fetch 해 폰트로 임베드.
 * 이모지는 넣지 않고 캐릭터 PNG(/animals/{id}.png, 절대 URL)로 대체한다.
 *
 * 데이터는 lib/animalTest 의 ANIMALS/SWAN import 만(수정 금지).
 * runtime 은 nodejs(App Hosting/Node) — 폰트·이미지 fetch 안정성을 위해.
 * ========================================================================== */

import { ImageResponse } from "next/og";
import { ANIMALS, SWAN, type Animal, type AnimalId } from "@/lib/animalTest";

export const runtime = "nodejs";

const CREAM = "#fff3e8";
const HEAT = "#d8461e"; // 열 색(OG 대비를 위해 core 보다 살짝 진하게)
const INK = "#1a1310";

// Pretendard OTF(한글 포함) — jsDelivr 공개 CDN. 무게 2종(Regular/Bold).
const FONT_REGULAR =
  "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-Regular.otf";
const FONT_BOLD =
  "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-Bold.otf";

function resolveAnimal(a: string | null): Animal | null {
  if (!a) return null;
  if (a === "swan") return SWAN;
  if (a in ANIMALS) return ANIMALS[a as Exclude<AnimalId, "swan">];
  return null;
}

let fontCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;
async function loadFonts() {
  if (fontCache) return fontCache;
  const [regular, bold] = await Promise.all([
    fetch(FONT_REGULAR).then((r) => r.arrayBuffer()),
    fetch(FONT_BOLD).then((r) => r.arrayBuffer()),
  ]);
  fontCache = { regular, bold };
  return fontCache;
}

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const animal = resolveAnimal(searchParams.get("a"));

  // 잘못된/없는 a → 홈 공통 OG 로 폴백(정적 preview 이미지로 리다이렉트).
  if (!animal) {
    return Response.redirect(`${origin}/preview-v2.png`, 302);
  }

  const { regular, bold } = await loadFonts();
  const imgSrc = `${origin}/animals/${animal.id}.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          background: CREAM,
          padding: "64px 72px",
          fontFamily: "Pretendard",
          position: "relative",
        }}
      >
        {/* 좌: 리소 캐릭터 PNG */}
        <div
          style={{
            display: "flex",
            width: "420px",
            height: "420px",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            width={420}
            height={420}
            alt=""
            style={{ width: "420px", height: "420px", objectFit: "contain" }}
          />
        </div>

        {/* 우: 온도 + 유형명 + 한줄평 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: "48px",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              color: HEAT,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            <span style={{ fontSize: "150px", letterSpacing: "-4px" }}>
              {animal.tempLabel}
            </span>
            <span style={{ fontSize: "56px", marginTop: "16px" }}>°C</span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "46px",
              fontWeight: 700,
              color: INK,
              marginTop: "24px",
              letterSpacing: "-1px",
            }}
          >
            {animal.name}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "32px",
              fontWeight: 400,
              color: HEAT,
              marginTop: "16px",
            }}
          >
            “{animal.oneLiner}”
          </div>
        </div>

        {/* 하단 라벨 */}
        <div
          style={{
            position: "absolute",
            left: "72px",
            bottom: "44px",
            display: "flex",
            fontSize: "24px",
            fontWeight: 400,
            color: "rgba(26,19,16,0.5)",
            letterSpacing: "1px",
          }}
        >
          the creative heatwave
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Pretendard", data: regular, weight: 400, style: "normal" },
        { name: "Pretendard", data: bold, weight: 700, style: "normal" },
      ],
      headers: {
        // 결과별 이미지가 안정적이므로 길게 캐시(공유 미리보기 재요청 비용 절감).
        "Cache-Control": "public, max-age=3600, s-maxage=86400, immutable",
      },
    },
  );
}
