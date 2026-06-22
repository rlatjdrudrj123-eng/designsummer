import { JetBrains_Mono } from "next/font/google";

/* Monospace display + body face for the Thermal Terminal concept (Concept 02).
 * Scoped to components/develop/c2Terminal/ only — loaded via next/font/google
 * here (NOT in app/layout) so it stays contained to this variant.
 *
 * JetBrains Mono (Google Fonts, SIL OFL) gives the console/terminal readout a
 * clean technical monospace voice. Exposed as a CSS var so the CSS Modules can
 * reference it explicitly and win over base ko font-family rules. */
export const terminalMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-c2-mono",
});
