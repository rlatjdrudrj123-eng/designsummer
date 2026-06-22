import AuraSite from "@/components/aura/AuraSite";

/* /aura — standalone Aura-ground site. Now INDEPENDENT of /develop: it renders
   AuraSite (components/aura/), which forks Hero / Chapter / DayBlock / Apply so
   editing /aura never affects /develop or the develop tabs. */
export const metadata = {
  title: "Design Summer 2026 · Aura",
};

export default function AuraPage() {
  return (
    <main>
      <AuraSite />
    </main>
  );
}
