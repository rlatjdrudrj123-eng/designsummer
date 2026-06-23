import images from "@/content/images.json";
import imageLinks from "@/content/imageLinks.json";

/* 업로드 이미지 매니페스트 (key → url). 어드민(Phase 5)이 갱신.
   key: kv / speaker-{id}(프로필) / poster-{id}(세션 포스터·로고). */
export type ImageMap = Record<string, string>;

export const imageMap: ImageMap = images as ImageMap;

export function imageUrl(key: string): string | null {
  /* 업로드된 슬롯은 확장자 무관 런타임 라우트(/api/img)로 서빙 → 로컬/터널에서
     재빌드 없이 업로드가 바로 반영(정적 경로는 빌드 이후 추가 파일을 못 서빙).
     미업로드 슬롯(매니페스트에 없음)은 null → 호출부 플레이스홀더 유지. */
  return imageMap[key] ? `/api/img/${key}` : null;
}

/* 이미지별 링크 매니페스트 (key → url). 어드민 "링크" 입력이 갱신. */
export type ImageLinkMap = Record<string, string>;
export const imageLinkMap: ImageLinkMap = imageLinks as ImageLinkMap;

/** 이미지 키에 연결된 링크 URL. 없으면 null. */
export function imageLink(key: string): string | null {
  const v = imageLinkMap[key];
  return v && v.trim() ? v : null;
}

/** 한 연사의 대표작 이미지들(여러 장) — 어드민이 관리하는 work-{id}-1..N 슬롯만 사용.
   ※ 번호 없는 레거시 base 키(work-{id})는 어드민에 슬롯이 없어 관리·삭제가 불가하고
   과거 잘못 저장된 이미지가 엉뚱한 연사에 노출되는 원인이라 더 이상 포함하지 않는다. */
export const WORK_SLOTS = 5;
export function workImages(id: string): string[] {
  const urls: string[] = [];
  for (let i = 1; i <= WORK_SLOTS; i++) {
    const u = imageMap[`work-${id}-${i}`];
    if (u) urls.push(u);
  }
  return urls;
}

/** workImages 와 동일한 순서의 이미지 키들. 각 대표작 썸네일의 링크 조회에 사용. */
export function workKeys(id: string): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= WORK_SLOTS; i++) {
    if (imageMap[`work-${id}-${i}`]) keys.push(`work-${id}-${i}`);
  }
  return keys;
}

/** 라인업 대표작 쇼케이스용 이미지 묶음 — 로고/포스터(poster-{id})를 앞세우고 대표작을 잇는다.
   아직 업로드 전이면 빈 배열. 호출부에서 플레이스홀더로 대체한다. */
export function showcaseImages(id: string): string[] {
  const urls: string[] = [];
  const poster = imageMap[`poster-${id}`];
  if (poster) urls.push(poster);
  for (const w of workImages(id)) if (!urls.includes(w)) urls.push(w);
  return urls;
}
