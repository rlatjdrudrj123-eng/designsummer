import type { Metadata } from "next";

/* /variants 페이지(page.tsx)가 "use client" 라서 metadata 를 직접 export 할 수 없다.
   라우트 세그먼트 layout 에서 noindex 를 선언해 검색 색인을 차단한다.
   (미완성 시안 라우트 — 정식 출시 대상은 `/` 하나.) */
export const metadata: Metadata = {
  title: "Design Summer · 비주얼 시안",
  robots: { index: false, follow: false },
};

export default function VariantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
