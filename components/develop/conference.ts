/* Re-export the shared conference content (now lives in @/lib/conference so
 * BOTH /develop and /variants can import the single source of truth).
 * Existing develop imports of "../conference" / "@/components/develop/conference"
 * keep working unchanged. */
export { conference } from "@/lib/conference";
export type { Conference, TimetableRow } from "@/lib/conference";
