import images from "@/content/images.json";
import imageLinks from "@/content/imageLinks.json";

/* 업로드 이미지 매니페스트 (key → 경로). 어드민이 갱신(Storage+Firestore).
   key: kv / speaker-{id}(프로필) / poster-{id} / work-{id}-{n}(대표작) 등.
   클라이언트는 번들 imageMap 으로 기본 동작하되, 서버에서 머지 매니페스트(번들+Firestore)를
   prop 으로 받으면 그걸 우선 사용한다(어드민이 빈 슬롯에 새로 올린 이미지도 반영). */
export type ImageMap = Record<string, string>;

export const imageMap: ImageMap = images as ImageMap;

/* 업로드 슬롯은 확장자·소스 무관 런타임 라우트(/api/img)로 서빙 → 로컬/터널/Storage
   모두 재빌드 없이 반영. 미업로드 슬롯(매니페스트에 없음)은 null → 호출부 플레이스홀더. */
export function imageUrl(
  key: string,
  manifest: ImageMap = imageMap,
): string | null {
  return manifest[key] ? `/api/img/${key}` : null;
}

/* 이미지별 링크 매니페스트 (key → url). 어드민 "링크" 입력이 갱신. */
export type ImageLinkMap = Record<string, string>;
export const imageLinkMap: ImageLinkMap = imageLinks as ImageLinkMap;

/** 이미지 키에 연결된 링크 URL. 없으면 null. */
export function imageLink(key: string): string | null {
  const v = imageLinkMap[key];
  return v && v.trim() ? v : null;
}

/** 한 연사의 대표작 이미지들(work-{id}-1..N 슬롯). 각 슬롯은 /api/img 로 서빙. */
export const WORK_SLOTS = 5;
export function workImages(id: string, manifest: ImageMap = imageMap): string[] {
  const urls: string[] = [];
  for (let i = 1; i <= WORK_SLOTS; i++) {
    if (manifest[`work-${id}-${i}`]) urls.push(`/api/img/work-${id}-${i}`);
  }
  return urls;
}

/** workImages 와 동일한 순서의 이미지 키들. 각 대표작 썸네일의 링크 조회에 사용. */
export function workKeys(id: string, manifest: ImageMap = imageMap): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= WORK_SLOTS; i++) {
    if (manifest[`work-${id}-${i}`]) keys.push(`work-${id}-${i}`);
  }
  return keys;
}

/** 라인업 대표작 쇼케이스용 이미지 묶음 — 로고/포스터(poster-{id})를 앞세우고 대표작을 잇는다. */
export function showcaseImages(
  id: string,
  manifest: ImageMap = imageMap,
): string[] {
  const urls: string[] = [];
  if (manifest[`poster-${id}`]) urls.push(`/api/img/poster-${id}`);
  for (const w of workImages(id, manifest)) if (!urls.includes(w)) urls.push(w);
  return urls;
}
