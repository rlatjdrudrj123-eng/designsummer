import AuraSite from "@/components/aura/AuraSite";
import { getAuraOverrides } from "@/lib/auraOverrides";
import { auraSpeakersByDayWith } from "@/lib/auraContent";
import { getManifestCached } from "@/lib/serverImages";

/* /aura — standalone Aura-ground site. Now INDEPENDENT of /develop: it renders
   AuraSite (components/aura/), which forks Hero / Chapter / DayBlock / Apply so
   editing /aura never affects /develop or the develop tabs. */
export const metadata = {
  title: "Design Summer 2026 · Aura",
  // 미완성 시안 라우트 — 검색 색인 차단 (정식 출시 대상은 `/` 하나).
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AuraPage() {
  const ov = await getAuraOverrides();
  const day1Speakers = auraSpeakersByDayWith(1, ov);
  const day2Speakers = auraSpeakersByDayWith(2, ov);
  const imageManifest = await getManifestCached();

  return (
    <main>
      <AuraSite
        day1Speakers={day1Speakers}
        day2Speakers={day2Speakers}
        imageManifest={imageManifest}
      />
    </main>
  );
}
