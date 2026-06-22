import { Archivo, Space_Mono } from "next/font/google";

/* Type system scoped to components/develop/c1Brutalist/ ONLY.
 * Loaded via next/font/google here (NOT in app/layout) so it stays contained
 * to this concept and never leaks into the base site or other variants.
 *
 * - Archivo (SIL OFL): heavy grotesque display + UI face. The architectural,
 *   condensable grotesque the brutalist/Swiss-grid concept calls for.
 * - Space Mono (SIL OFL): monospace for meta, numbers, section indices,
 *   timetable times — the editorial "spec sheet" register.
 *
 * Exposed as CSS vars so the module CSS can reference them explicitly and win
 * reliably over base font-family rules regardless of source order.
 */
export const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--bru-sans",
});

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--bru-mono",
});
