import { Fraunces, Inter } from "next/font/google";

/* Fonts scoped to components/develop/c4Serif only (loaded here, NOT in
 * app/layout, so they stay contained to this concept variant).
 *
 * Concept 04 — Soft Serif Editorial:
 *   · Fraunces (Google Fonts, SIL OFL) — a soft, high-contrast "old-style"
 *     serif used as the large expressive DISPLAY face. Optical size + a touch
 *     of "softness/wonky" axis give it the warm fashion-journal character.
 *   · Inter (SIL OFL) — the quiet neutral sans used for meta / labels / body.
 *
 * Exposed as CSS vars so the module CSS can reference them explicitly and win
 * over any base font-family rules regardless of source order.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  // variable font: omit `weight` so the wght axis stays variable (custom axes
  // like SOFT/WONK/opsz can only be combined with a variable weight).
  style: ["normal", "italic"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--c4-serif",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--c4-sans",
});
