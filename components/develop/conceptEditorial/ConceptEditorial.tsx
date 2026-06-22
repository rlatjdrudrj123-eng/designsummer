"use client";

import { useRef } from "react";
import Hero from "../Hero";
import PostHeroAura from "../PostHeroAura";
import AboutSection from "../AboutSection";
import AudienceSection from "../AudienceSection";
import Timetable from "../Timetable";
import BenefitsSection from "../BenefitsSection";
import Directions from "../Directions";
import FaqSection from "../FaqSection";
import Apply from "../Apply";
import Footer from "../Footer";
import ScrollCue from "../ScrollCue";
import EditorialLineup from "./EditorialLineup";
import styles from "./ConceptEditorial.module.css";

/* ConceptEditorial — an EDITORIAL / MAGAZINE concept variation of the develop
   page that KEEPS the existing KV tone & manner:

     · the warm heat-field <Hero/> (reused as-is, unchanged tone)
     · the ONE continuous warm multi-color PostHeroAura ground for everything
       below the hero (red-orange Day 1 → gold Day 2 drift)

   It only swaps the LINEUP: instead of the frosted card grid, speakers are
   presented as generous full-width editorial feature blocks (EditorialLineup).
   The shared develop sections — Timetable / Directions / Apply / Footer — are
   reused verbatim so the schedule/venue/apply/footer stay identical.

   Region wrapper: this mirrors develop's PostHeroRegion (a single PostHeroAura
   field at z-index 0, transparent content floating above at z-index 1) but is
   self-contained in this folder so all edits stay here. PostHeroAura is
   imported and reused unchanged, driven by this wrapper's scroll travel. */
export default function ConceptEditorial() {
  const regionRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <Hero />
      <div ref={regionRef} className={styles.region}>
        <PostHeroAura targetRef={regionRef} />
        <div className={styles.content}>
          <AboutSection />
          <AudienceSection />
          <EditorialLineup day={1} />
          <EditorialLineup day={2} />
          <Timetable />
          <BenefitsSection />
          <Directions />
          <FaqSection />
          <Apply />
          <Footer />
        </div>
      </div>
      <ScrollCue />
    </>
  );
}
