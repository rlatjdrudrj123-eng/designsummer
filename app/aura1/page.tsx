import Aura1 from "@/components/aura1/Aura1";

/* /aura1 — identical to /aura (the full <DevelopSite aura /> warm-aura page) with
   one addition: a sticky Day1/Day2 anchor-nav bar. */
export const metadata = {
  title: "Design Summer 2026 · Aura 1",
  // 미완성 시안 라우트 — 검색 색인 차단 (정식 출시 대상은 `/` 하나).
  robots: { index: false, follow: false },
};

export default function Aura1Page() {
  return <Aura1 />;
}
