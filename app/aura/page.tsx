import AuraSite from "@/components/aura/AuraSite";

/* /aura — standalone Aura-ground site. Now INDEPENDENT of /develop: it renders
   AuraSite (components/aura/), which forks Hero / Chapter / DayBlock / Apply so
   editing /aura never affects /develop or the develop tabs. */
export const metadata = {
  title: "Design Summer 2026 · Aura",
  // 미완성 시안 라우트 — 검색 색인 차단 (정식 출시 대상은 `/` 하나).
  robots: { index: false, follow: false },
};

export default function AuraPage() {
  return (
    <main>
      <AuraSite />
    </main>
  );
}
