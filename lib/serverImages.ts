import { promises as fs } from "node:fs";
import path from "node:path";
import { COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";

/* 어드민 이미지 저장 (로컬 FS). public/uploads + content/images.json 갱신.
   프로덕션은 이 파일들을 커밋해 정적 서빙. (라이브 업로드가 필요해지면 Vercel Blob 으로 교체) */
const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "content", "images.json");
const LINKS = path.join(ROOT, "content", "imageLinks.json");
const UPLOADS = path.join(ROOT, "public", "uploads");

/* 업로드 제약: 경로 탐색 차단용 key 화이트리스트, 허용 이미지 타입, 크기 상한. */
const KEY_RE = /^[a-z0-9][a-z0-9-]*$/;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB

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
  // WEBP: "RIFF"...."WEBP"
  if (buf.length >= 12 &&
      buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) {
    return "webp";
  }
  // AVIF / HEIC: ftyp 박스 brand 검사
  if (buf.length >= 12 &&
      buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) {
    const brand = buf.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "avis") return "avif";
  }
  // SVG: 텍스트 기반. <svg 또는 <?xml ... <svg 패턴(선두 공백/BOM 허용).
  const head = buf.toString("utf8", 0, Math.min(buf.length, 512)).trimStart();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) {
    return "svg";
  }
  return null;
}

type Manifest = Record<string, string>;

export async function readManifest(): Promise<Manifest> {
  try {
    return JSON.parse(await fs.readFile(MANIFEST, "utf8"));
  } catch {
    return {};
  }
}

async function writeManifest(m: Manifest) {
  const sorted = Object.fromEntries(
    Object.keys(m)
      .sort()
      .map((k) => [k, m[k]]),
  );
  await fs.writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");
}

async function removeKeyFiles(key: string) {
  assertValidKey(key);
  const files = await fs.readdir(UPLOADS).catch(() => [] as string[]);
  for (const f of files) {
    if (f.startsWith(key + ".")) {
      await fs.unlink(path.join(UPLOADS, f)).catch(() => {});
    }
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
  // 확장자(file.name) 가 아니라 매직넘버로 이미지인지 확인.
  const ext = sniffImage(buf);
  if (!ext) {
    throw new Error("unsupported file type (not a recognized image)");
  }
  await fs.mkdir(UPLOADS, { recursive: true });
  await removeKeyFiles(key); // 같은 키의 기존 파일(확장자 무관) 제거
  const name = `${key}.${ext}`;
  // 최종 경로가 UPLOADS 밖으로 벗어나지 않는지 한 번 더 방어.
  const dest = path.join(UPLOADS, name);
  if (path.dirname(dest) !== UPLOADS) {
    throw new Error("resolved path escapes uploads dir");
  }
  await fs.writeFile(dest, buf);
  const m = await readManifest();
  m[key] = `/uploads/${name}`;
  await writeManifest(m);
  return m[key];
}

export async function deleteUpload(key: string) {
  assertValidKey(key);
  await removeKeyFiles(key);
  const m = await readManifest();
  delete m[key];
  await writeManifest(m);
}

/* 이미지별 링크 저장 (로컬 FS). content/imageLinks.json 갱신. */
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
