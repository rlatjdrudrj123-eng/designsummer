import { promises as fs } from "node:fs";
import path from "node:path";

/* 어드민 이미지 저장 (로컬 FS). public/uploads + content/images.json 갱신.
   프로덕션은 이 파일들을 커밋해 정적 서빙. (라이브 업로드가 필요해지면 Vercel Blob 으로 교체) */
const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "content", "images.json");
const LINKS = path.join(ROOT, "content", "imageLinks.json");
const UPLOADS = path.join(ROOT, "public", "uploads");

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
  const files = await fs.readdir(UPLOADS).catch(() => [] as string[]);
  for (const f of files) {
    if (f.startsWith(key + ".")) {
      await fs.unlink(path.join(UPLOADS, f)).catch(() => {});
    }
  }
}

export async function saveUpload(key: string, file: File): Promise<string> {
  await fs.mkdir(UPLOADS, { recursive: true });
  await removeKeyFiles(key); // 같은 키의 기존 파일(확장자 무관) 제거
  const ext = (file.name.split(".").pop() || "png")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const name = `${key}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOADS, name), buf);
  const m = await readManifest();
  m[key] = `/uploads/${name}`;
  await writeManifest(m);
  return m[key];
}

export async function deleteUpload(key: string) {
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

/** 요청 쿠키로 어드민 인증 확인. */
export function checkAuth(req: Request): boolean {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)ds_admin=([^;]+)/);
  const token = m ? decodeURIComponent(m[1]) : "";
  return !!process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
}
