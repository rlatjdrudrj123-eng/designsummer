import Hero from "../Hero";
import AboutSection from "../AboutSection";
import AudienceSection from "../AudienceSection";
import Timetable from "../Timetable";
import BenefitsSection from "../BenefitsSection";
import Directions from "../Directions";
import FaqSection from "../FaqSection";
import Apply from "../Apply";
import Footer from "../Footer";
import IndexAuraRegion from "./IndexAuraRegion";
import IndexLineup from "./IndexLineup";

/**
 * ConceptIndex — a concept variation of the develop page.
 *
 * Tone & manner are KEPT identical to the develop site: the same warm heat-field
 * Hero (reused unchanged) and the same warm multi-color Aura ground (the shared
 * PostHeroAura field, with its Day1 -> Day2 warmth drift) sit below it via
 * IndexAuraRegion — an equivalent of components/develop/PostHeroRegion.
 *
 * What CHANGES is only the LINEUP: instead of frosted photo cards, the 8
 * speakers are presented as a MINIMAL TYPOGRAPHIC INDEX (IndexLineup) — a
 * numbered 01..08 archive index of large studio names + session titles that
 * expand on hover/focus/tap to reveal the session description and a small
 * Canvas2D works strip. The shared SCHEDULE / VENUE / APPLY / FOOTER sections
 * are reused verbatim so the rest of the page is unchanged.
 *
 * Self-contained, no props. The <main> wrapper is supplied by the caller, same
 * as DevelopSite.
 */
export default function ConceptIndex() {
  return (
    <>
      <Hero />
      <IndexAuraRegion>
        <AboutSection />
        <AudienceSection />
        <IndexLineup />
        <Timetable />
        <BenefitsSection />
        <Directions />
        <FaqSection />
        <Apply />
        <Footer />
      </IndexAuraRegion>
    </>
  );
}
