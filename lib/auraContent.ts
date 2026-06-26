import { speakers, type Speaker } from "@/lib/content";
import overridesData from "@/content/auraSpeakers.json";

/* /aura 전용 편집 가능 콘텐츠.
   base = speakers.json (id/day/order/time/studioEn/imageKey 등 구조는 여기서 유지),
   overrides = 어드민 "Aura 연사 내용"에서 수정 → Firestore(content/auraSpeakers)에 저장.
   content/auraSpeakers.json 은 번들 기준선(마지막 배포 상태)으로만 남는다.
   override 값이 존재하고 비어있지 않으면 override 가 이김. 아니면 base.

   이 파일은 클라이언트에서도 import 가능해야 하므로(firebase-admin 의존 금지),
   Firestore 읽기/쓰기는 lib/auraOverrides.ts(server-only)에서 담당하고 여기엔
   override 맵을 인자로 받는 순수 병합 함수만 둔다. */

export type AuraOverride = {
  studio?: string;
  name?: string;
  role?: string;
  sessionTitle?: string;
  sessionDesc?: string;
  credentials?: string[];
  url?: string;
};

export type AuraOverrideMap = Record<string, AuraOverride>;

/** 번들 JSON 기준선(content/auraSpeakers.json). Firestore 미연결 시 폴백. */
export const bundledOverrides = overridesData as AuraOverrideMap;

function pick(over: string | undefined, base: string): string {
  const v = (over ?? "").trim();
  return v ? over! : base;
}

function mergeSpeaker(s: Speaker, ov: AuraOverrideMap): Speaker {
  const o = ov[s.id];
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

/* override 맵을 받아 병합 — 서버에서 Firestore override 를 읽어 넘긴다. */
export function auraSpeakersWith(ov: AuraOverrideMap): Speaker[] {
  return speakers.map((s) => mergeSpeaker(s, ov));
}

export function auraSpeakersByDayWith(day: 1 | 2, ov: AuraOverrideMap): Speaker[] {
  return speakers.filter((s) => s.day === day).map((s) => mergeSpeaker(s, ov));
}

/* ── 번들 기준선만으로 병합(Firestore 불필요한 곳·폴백용) ── */
export function auraSpeakers(): Speaker[] {
  return auraSpeakersWith(bundledOverrides);
}

export function auraSpeakersByDay(day: 1 | 2): Speaker[] {
  return auraSpeakersByDayWith(day, bundledOverrides);
}
