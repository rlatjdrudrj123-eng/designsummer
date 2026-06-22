import { Archivo_Black, Space_Grotesk } from "next/font/google";

/* Type system scoped to components/develop/c5Kinetic/ ONLY.
 *
 * Loaded via next/font/google HERE (not in app/layout) so the faces stay
 * contained to this concept and never leak into the base site or other
 * variants.
 *
 * REBALANCED — the KINETIC identity is restored: the heavy display face
 * (Archivo Black, 900) drives the main display headlines so the page reads
 * boldly and kinetically again, while the formal B2B copy + whitespace from the
 * previous pass are kept. This is the "bold but tasteful" middle ground: heavy
 * display for headlines/labels, NOT wall-to-wall brutalist color bands.
 *
 * - Archivo Black (SIL OFL): a single-weight (900) grotesque used for the
 *   display headlines, section titles, day tags and the signature marquee —
 *   the loud, confident voice that signals the "Kinetic" concept.
 * - Space Grotesk (SIL OFL): a sharp contemporary grotesque for body, labels,
 *   numbers and meta — keeps the page coherent and readable at text sizes.
 *
 * Exposed as CSS vars so the module CSS references them explicitly and wins
 * over base font rules regardless of source order. Korean text falls back to
 * the global Pretendard stack; these faces drive Latin display/label text.
 *
 * The export is named `archivoBlack` and resolves to the Archivo Black family.
 */
export const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400", // Archivo Black ships a single 400 face that IS the heavy cut
  display: "swap",
  variable: "--kin-display",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--kin-text",
});
