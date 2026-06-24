import type { MetadataRoute } from "next";

/* sitemap.xml 생성 — Next.js Metadata Files API.
   정식 페이지(`/`)만 포함. 시안/admin/api 라우트는 색인 대상이 아니므로 제외. */
const BASE_URL = "https://design-summer.kr";

/* lastModified — 콘텐츠 최종 갱신일을 명시한다.
   매 빌드마다 바뀌는 new Date() 대신, 안정적인 갱신 신호를 주도록 환경변수
   (NEXT_PUBLIC_SITE_LASTMOD, 예: "2026-06-24")가 있으면 그 값을, 없으면
   본문 갱신 기준일을 사용한다. 콘텐츠를 실제로 고칠 때 이 값을 올린다. */
const LAST_MODIFIED = process.env.NEXT_PUBLIC_SITE_LASTMOD ?? "2026-06-24";

/* 대표 이미지(OG/포스터) — 이미지 사이트맵 확장(image:image).
   라이브 `/` 하나만 대상으로 유지. */
const OG_IMAGE = `${BASE_URL}/preview-v2.png`;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(LAST_MODIFIED),
      changeFrequency: "weekly",
      priority: 1,
      images: [OG_IMAGE],
    },
  ];
}
