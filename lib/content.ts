import site from "@/content/site.json";
import speakersData from "@/content/speakers.json";

export type Speaker = {
  id: string;
  day: 1 | 2;
  order: number;
  time: string;
  studio: string;
  studioEn: string;
  name: string;
  role: string;
  sessionTitle: string;
  sessionDesc: string;
  credentials: string[];
  imageKey: string;
  url?: string; // 연사/스튜디오 홈페이지 (선택)
};

export type SiteContent = typeof site;

export const siteContent: SiteContent = site;

export const speakers: Speaker[] = (speakersData as Speaker[])
  .slice()
  .sort((a, b) => a.day - b.day || a.order - b.order);

export function speakersByDay(day: 1 | 2): Speaker[] {
  return speakers.filter((s) => s.day === day);
}

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-08-20" → { md: "08.20", dow: "목" } (고정 문자열 파싱 → SSR/CSR 일치) */
export function formatDate(iso: string): { md: string; dow: string } {
  const [, m, d] = iso.split("-");
  const dow = WEEKDAY_KO[new Date(`${iso}T00:00:00`).getDay()];
  return { md: `${m}.${d}`, dow };
}
