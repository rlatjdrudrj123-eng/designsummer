import { promises as fs } from "node:fs";
import path from "node:path";
import { COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { getDb, getBucket } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import bundledImages from "@/content/images.json";

/* 어드민 이미지 저장.
   - 바이트: Cloud Storage(uploads/{key}.{ext}) — App Hosting FS 가 ephemeral 이라 영구 저장.
   - 매니페스트(key→경로): Firestore 문서 content/images 의 manifest 필드.
   사이트는 번들 content/images.json(커밋된 baseline) 위에 Firestore manifest 를 머지해
   읽고, /api/img/[key] 가 값에 따라 로컬(public/uploads) 또는 Storage 에서 서빙한다.
   매니페스트 값 규약: '/uploads/...'(앞 슬래시) = 번들 로컬, 'uploads/...'(슬래시 없음)
   = Storage 오브젝트 경로.
   ※ 이미지별 링크(imageLinks)는 아직 로컬 FS — 별도 후속에서 영구화. */

const ROOT = process.cwd();
const LINKS = path.join(ROOT, "content", "imageLinks.json");
const IMAGES_DOC = "content/images";

const KEY_RE = /^[a-z0-9][a-z0-9-]*$/;
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB (고해상 대표작 대비)

const CONTENT_TYPE: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
};

/** key 가 안전한 파일명 토큰인지(경로 탐색·구분자 차단) 검증. */
export function isValidKey(key: string): boolean {
  return KEY_RE.test(key);
}

function assertValidKey(key: string): void {
  if (!isValidKey(key)) {
    throw new Error(`invalid key: ${JSON.stringify(key)}`);
  }
}

/** 이미지 매직넘버 → 확장자. 미지원이면 null. file.name 은 신뢰하지 않는다. */
function sniffImage(buf: Buffer): string | null {
  if (buf.length >= 8 &&
      buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
      buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a) {
    return "png";
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "jpg";
  }
  if (buf.length >= 6 &&
      buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 &&
      buf[3] === 0x38 && (buf[4] === 0x37 || buf[4] === 0x39) && buf[5] === 0x61) {
    return "gif";
  }
  if (buf.length >= 12 &&
      buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) {
    return "webp";
  }
  if (buf.length >= 12 &&
      buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) {
    const brand = buf.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "avis") return "avif";
  }
  const head = buf.toString("utf8", 0, Math.min(buf.length, 512)).trimStart();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) {
    return "svg";
  }
  return null;
}

export type Manifest = Record<string, string>;

/** 번들 baseline + Firestore manifest 머지(캐시 없음). 어드민·내부용. */
export async function readManifest(): Promise<Manifest> {
  const db = getDb();
  let fsm: Manifest = {};
  if (db) {
    try {
      const snap = await db.doc(IMAGES_DOC).get();
      fsm =
        (snap.data() as { manifest?: Manifest } | undefined)?.manifest ?? {};
    } catch {
      /* ignore → baseline 만 */
    }
  }
  return { ...(bundledImages as Manifest), ...fsm };
}

/* 공개 서빙(/api/img)용 — 인스턴스 10초 메모리 캐시(이미지마다 DB 직격 방지). */
let manifestMemo: { at: number; data: Manifest } | null = null;
export async function getManifestCached(): Promise<Manifest> {
  const now = Date.now();
  if (manifestMemo && now - manifestMemo.at < 10_000) return manifestMemo.data;
  const data = await readManifest();
  manifestMemo = { at: now, data };
  return data;
}

/** 같은 key 의 기존 Storage 오브젝트(확장자 무관) 제거. */
async function removeStorageKey(key: string) {
  const bucket = getBucket();
  if (!bucket) return;
  try {
    const [files] = await bucket.getFiles({ prefix: `uploads/${key}.` });
    await Promise.all(files.map((f) => f.delete().catch(() => {})));
  } catch {
    /* ignore */
  }
}

export async function saveUpload(key: string, file: File): Promise<string> {
  assertValidKey(key);
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`file too large: ${file.size} > ${MAX_UPLOAD_BYTES}`);
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length === 0 || buf.length > MAX_UPLOAD_BYTES) {
    throw new Error(`invalid file size: ${buf.length}`);
  }
  // 확장자(file.name)가 아니라 매직넘버로 이미지인지 확인.
  const ext = sniffImage(buf);
  if (!ext) {
    throw new Error("unsupported file type (not a recognized image)");
  }
  const bucket = getBucket();
  if (!bucket) throw new Error("storage unavailable");
  const db = getDb();
  if (!db) throw new Error("db unavailable");

  await removeStorageKey(key); // 같은 키의 기존 파일(확장자 무관) 제거
  const objectPath = `uploads/${key}.${ext}`;
  await bucket.file(objectPath).save(buf, {
    resumable: false,
    contentType: CONTENT_TYPE[ext] ?? "application/octet-stream",
    metadata: { cacheControl: "public, max-age=300" },
  });
  await db
    .doc(IMAGES_DOC)
    .set({ manifest: { [key]: objectPath } }, { merge: true });
  manifestMemo = null; // 같은 인스턴스 즉시 반영
  return objectPath;
}

export async function deleteUpload(key: string) {
  assertValidKey(key);
  await removeStorageKey(key);
  const db = getDb();
  if (db) {
    try {
      await db
        .doc(IMAGES_DOC)
        .set({ manifest: { [key]: FieldValue.delete() } }, { merge: true });
    } catch {
      /* ignore */
    }
  }
  manifestMemo = null;
}

/* 이미지별 링크 저장 (아직 로컬 FS — content/imageLinks.json. 후속에서 영구화). */
type LinkMap = Record<string, string>;

async function readLinks(): Promise<LinkMap> {
  try {
    return JSON.parse(await fs.readFile(LINKS, "utf8"));
  } catch {
    return {};
  }
}

async function writeLinks(m: LinkMap) {
  const sorted = Object.fromEntries(
    Object.keys(m)
      .sort()
      .map((k) => [k, m[k]]),
  );
  await fs.writeFile(LINKS, JSON.stringify(sorted, null, 2) + "\n");
}

export async function saveLink(key: string, url: string) {
  const m = await readLinks();
  m[key] = url;
  await writeLinks(m);
}

export async function deleteLink(key: string) {
  const m = await readLinks();
  delete m[key];
  await writeLinks(m);
}

/** 요청 쿠키로 어드민 인증 확인. 쿠키엔 서명 토큰만 들어있고 timing-safe 비교한다. */
export async function checkAuth(req: Request): Promise<boolean> {
  const cookie = req.headers.get("cookie") || "";
  const re = new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`);
  const m = cookie.match(re);
  const token = m ? decodeURIComponent(m[1]) : "";
  return verifySessionToken(token);
}
