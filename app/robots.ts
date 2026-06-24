import type { MetadataRoute } from "next";

/* robots.txt 생성 — Next.js Metadata Files API.
   정식 출시 대상은 `/` 하나. 미완성 시안 라우트와 admin/api 는 크롤링 차단. */
const BASE_URL = "https://design-summer.kr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/aura", "/aura1", "/develop", "/variants", "/admin", "/api"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
