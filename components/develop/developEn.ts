/* English-variant strings for the develop site, scoped to components/develop/.
 *
 * IMPORTANT (project copy rule): we do NOT fabricate English versions of the
 * session TITLE or credentials — that is creative/marketing copy. Only factual,
 * verifiable mappings live here: romanized speaker names (Revised Romanization,
 * best-effort), concise factual English ROLE descriptors, the English VENUE,
 * and English DATE formatting. The fixed English headline strings live in the
 * components that use them ("Design Summer Ilsan", "the Creative Heatwave",
 * "KINTEX Exhibition Hall 2").
 *
 * NOTE: romanized names + role translations are BEST-EFFORT and should be
 * client-verified before launch.
 */

export type Lang = "ko" | "en";

/** Fixed English venue label (used wherever the venue appears in en mode). */
export const VENUE_EN = "KINTEX Exhibition Hall 2";

/** Romanized speaker names, keyed by speaker id (Revised Romanization, best-effort). */
const NAME_EN: Record<string, string> = {
  rojotype: "Kim Gi-chang",
  ordinarypeople: "Seo Jeong-min",
  woot: "Go Seong-woo",
  arkabrik: "Cho Myeong-hun",
  aurg: "Park Jin-taek",
  ohseven: "Bae Su-gyu",
  taechang: "Lee Ho-jun",
  patterny: "Lee Yo-anna",
};

/* Concise, factual English role descriptors, keyed by speaker id. These translate
   the Korean role/title only — no embellishment. */
const ROLE_EN: Record<string, string> = {
  rojotype: "Graphic & Type Designer",
  ordinarypeople: "Graphic Designer",
  woot: "3D Motion Graphics Director",
  arkabrik: "Creative Director",
  aurg: "Brand Design Director",
  ohseven: "Founder, ohSeven",
  taechang: "CEO, Taechang Gold Foil",
  patterny: "Pattern Designer & Illustrator",
};

export function speakerNameEn(id: string, fallback: string): string {
  return NAME_EN[id] ?? fallback;
}

export function speakerRoleEn(id: string, fallback: string): string {
  return ROLE_EN[id] ?? fallback;
}

/* English SESSION TITLES, keyed by speaker id.
   These are BEST-EFFORT FAITHFUL TRANSLATIONS of the existing Korean
   `sessionTitle` in content/speakers.json — not new marketing copy. They render
   in en mode only and MUST be client-verified before launch. Newlines (\n)
   mirror the Korean two-line titles so Lineup's line-split rendering is preserved.
   If a key is missing, Lineup falls back to the Korean sessionTitle. */
const SESSION_TITLE_EN: Record<string, string> = {
  rojotype: "The Print Beginners rojotype Met",
  ordinarypeople: "Three Questions That Build a Brand",
  woot:
    "Turn Off Everything Unnecessary\nMotion Graphics That Go Beyond Pretty to Persuasive",
  arkabrik: "In the Age of AI, What Should Designers Focus On?",
  aurg: "Creative Brand Visuals That Cut Through the Concept",
  ohseven: "Design Is Business, Not Taste",
  taechang: "The Power of Foil Printing That Completes a Design",
  patterny: "What to Consider When Printing Pattern Designs",
};

export function speakerSessionTitleEn(id: string, fallback: string): string {
  return SESSION_TITLE_EN[id] ?? fallback;
}

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-08-20" → "Aug 20" (no weekday). */
export function formatDateEn(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${MONTH_ABBR[Number(m) - 1]} ${Number(d)}`;
}

/**
 * Two ISO dates → a compact English range, e.g.
 * ["2026-08-20","2026-08-21"] → "Aug 20–21, 2026".
 * Falls back gracefully if only one date is present.
 */
export function formatDateRangeEn(dates: string[]): string {
  if (dates.length === 0) return "";
  const [y0, m0, d0] = dates[0].split("-");
  if (dates.length === 1) {
    return `${MONTH_ABBR[Number(m0) - 1]} ${Number(d0)}, ${y0}`;
  }
  const last = dates[dates.length - 1];
  const [y1, m1, d1] = last.split("-");
  const startMonth = MONTH_ABBR[Number(m0) - 1];
  const endMonth = MONTH_ABBR[Number(m1) - 1];
  // same month → "Aug 20–21, 2026"; cross-month → "Aug 20 – Sep 1, 2026"
  const right =
    m0 === m1
      ? `${Number(d0)}–${Number(d1)}`
      : `${startMonth} ${Number(d0)} – ${endMonth} ${Number(d1)}`;
  const left = m0 === m1 ? `${startMonth} ` : "";
  return `${left}${right}, ${y1}`;
}
