import { Saira_Condensed } from "next/font/google";

/* English-version display face, scoped to components/develop/ only.
 *
 * The English comp asks for "Franklin Gothic Medium Cond" — there is no freely
 * licensable Franklin Gothic Cond web font, so we use Saira Condensed (Google
 * Fonts, SIL OFL) as the free SUBSTITUTE and treat it as such. Weights 500/600
 * match the "Medium" register. Loaded via next/font/google here (NOT in
 * app/layout) so it stays contained to the develop English variant.
 *
 * Apply `sairaCondensed.className` to the English display elements (en Hero
 * title + tagline, en studio labels). ko mode never references this.
 */
export const sairaCondensed = Saira_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  // expose as a CSS var so the develop English CSS can reference it explicitly
  // and reliably win over the base ko font-family rules regardless of source order.
  variable: "--font-develop-en",
});
