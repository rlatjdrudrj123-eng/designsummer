import Hero from "../Hero";
import AboutSection from "../AboutSection";
import AudienceSection from "../AudienceSection";
import Timetable from "../Timetable";
import BenefitsSection from "../BenefitsSection";
import Directions from "../Directions";
import FaqSection from "../FaqSection";
import Apply from "../Apply";
import Footer from "../Footer";
import PanelRegion from "./PanelRegion";
import DayMarker from "./DayMarker";
import ImmersivePanel from "./ImmersivePanel";
import { speakersByDay } from "@/lib/content";
import styles from "./ConceptStage.module.css";

/**
 * ConceptStage — a CONCEPT VARIATION of the develop page.
 *
 * Tone & manner is KEPT identical to the original develop page:
 *   • the warm heat-field Hero (reused unchanged: develop/Hero), and
 *   • the warm multi-color Aura gradient ground (reused develop/PostHeroAura
 *     via PanelRegion) carrying the warm Day1 → Day2 color drift.
 *
 * What changes is the LINEUP: instead of frosted speaker cards in a gutter
 * grid, each speaker is a LARGE, near-full-viewport IMMERSIVE PANEL where a
 * GIANT warm tonal studio name melts into the aura, with the session title,
 * supporting name/role, and ONE large work image composed dramatically and
 * revealed cinematically on scroll (rAF parallax + reveal, no scrolljacking).
 * A bold tonal DayMarker panel sits between Day 1 and Day 2.
 *
 * SCHEDULE / VENUE / APPLY / FOOTER reuse the SHARED develop sections so the
 * concept stays consistent with the rest of the site. <main> is supplied by
 * the caller (this matches DevelopSite's contract).
 */
export default function ConceptStage() {
  const day1 = speakersByDay(1);
  const day2 = speakersByDay(2);

  return (
    <>
      <Hero />
      <PanelRegion>
        <AboutSection />
        <AudienceSection />
        <div className={styles.lineup} aria-label="라인업">
          <DayMarker day={1} />
          {day1.map((s, i) => (
            <ImmersivePanel key={s.id} s={s} index={i} />
          ))}
          <DayMarker day={2} />
          {day2.map((s, i) => (
            <ImmersivePanel key={s.id} s={s} index={i} />
          ))}
        </div>
        <Timetable />
        <BenefitsSection />
        <Directions />
        <FaqSection />
        <Apply />
        <Footer />
      </PanelRegion>
    </>
  );
}
