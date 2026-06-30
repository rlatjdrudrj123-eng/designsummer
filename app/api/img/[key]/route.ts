import { promises as fs } from "node:fs";
import path from "node:path";
import { getManifestCached } from "@/lib/serverImages";
import { getBucket } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* 확장자 무관 런타임 이미지 서빙.
   경로를 /api/img/{key} 로 고정하고, 머지 매니페스트(번들 + Firestore)를 읽어
   값에 따라 서빙한다:
   - '/uploads/...'(앞 슬래시) = 번들 로컬 파일(public/uploads) 그대로 서빙
   - 'uploads/...'(슬래시 없음) = Cloud Storage 오브젝트 → SA 로 다운로드해 프록시
   → 어떤 확장자로 올려도, 재배포 없이도 반영. 업로드는 Storage 라 영구. */
const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
};

const CACHE = "public, max-age=60, must-revalidate";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  try {
    const manifest = await getManifestCached();
    const val = manifest[key];
    if (!val) return new Response("not found", { status: 404 });

    const ext = (val.split(".").pop() || "").toLowerCase();
    const type = TYPES[ext] ?? "application/octet-stream";

    if (val.startsWith("/")) {
      // 번들 로컬 파일
      const file = path.join(process.cwd(), "public", val.replace(/^\//, ""));
      const buf = await fs.readFile(file);
      return new Response(new Uint8Array(buf), {
        headers: { "Content-Type": type, "Cache-Control": CACHE },
      });
    }

    // Cloud Storage 오브젝트 → 프록시
    const bucket = getBucket();
    if (!bucket) return new Response("not found", { status: 404 });
    const [buf] = await bucket.file(val).download();
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": type, "Cache-Control": CACHE },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
