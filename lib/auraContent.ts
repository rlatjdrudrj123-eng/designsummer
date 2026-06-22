import { speakers, type Speaker } from "@/lib/content";
import overridesData from "@/content/auraSpeakers.json";

/* /aura 전용 편집 가능 콘텐츠.
   base = speakers.json (id/day/order/time/studioEn/imageKey 등 구조는 여기서 유지),
   overrides = content/auraSpeakers.json (어드민 "Aura 연사 내용"에서 직접 수정).
   override 값이 존재하고 비어있지 않으면 override 가 이김. 아니면 base. */

export type AuraOverride = {
  studio?: string;
  name?: string;
  role?: string;
  sessionTitle?: string;
  sessionDesc?: string;
  credentials?: string[];
  url?: string;
};

const overrides = overridesData as Record<string, AuraOverride>;

function pick(over: string | undefined, base: string): string {
  const v = (over ?? "").trim();
  return v ? over! : base;
}

function mergeSpeaker(s: Speaker): Speaker {
  const o = overrides[s.id];
  if (!o) return s;
  const creds =
    Array.isArray(o.credentials) && o.credentials.some((c) => c.trim())
      ? o.credentials.map((c) => c.trim()).filter(Boolean)
      : s.credentials;
  const overUrl = (o.url ?? "").trim();
  const url = overUrl ? overUrl : s.url;
  return {
    ...s,
    studio: pick(o.studio, s.studio),
    name: pick(o.name, s.name),
    role: pick(o.role, s.role),
    sessionTitle: pick(o.sessionTitle, s.sessionTitle),
    sessionDesc: pick(o.sessionDesc, s.sessionDesc),
    credentials: creds,
    url,
  };
}

export function auraSpeakers(): Speaker[] {
  return speakers.map(mergeSpeaker);
}

export function auraSpeakersByDay(day: 1 | 2): Speaker[] {
  return speakers.filter((s) => s.day === day).map(mergeSpeaker);
}
