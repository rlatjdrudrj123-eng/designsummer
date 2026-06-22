import { Anton, Archivo } from "next/font/google";

/* Display + text faces scoped to the c3Riso (Risograph Poster) concept only.
 *
 * Anton — a heavy condensed grotesque, the workhorse of printed poster
 * headlines. Used for the big hero poster type and section banners.
 * Archivo — a sturdy grotesque for Latin labels/credits.
 *
 * Loaded via next/font/google HERE (not app/layout) so the faces stay
 * contained to this concept. Korean text falls back to the global Pretendard
 * stack; these faces only drive Latin display/label text.
 */
export const antonDisplay = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--riso-display",
});

export const archivoLabel = Archivo({
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
  variable: "--riso-label",
});
