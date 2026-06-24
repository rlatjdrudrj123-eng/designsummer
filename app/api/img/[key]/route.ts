import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* 확장자 무관 런타임 이미지 서빙.
   정적 HTML 에 /uploads/key.확장자 가 박혀버리면(예: .png) 같은 키를 다른 확장자(jpg)로
   교체할 때 옛 경로가 404(엑박) 가 된다. 이 라우트는 경로를 /api/img/{key} 로 고정하고,
   요청 시 content/images.json 을 디스크에서 새로 읽어 현재 업로드된 실제 파일을 서빙한다.
   → 어떤 확장자로 올려도, 재배포 없이도 즉시 반영. */
const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  try {
    const manifest = JSON.parse(
      await fs.readFile(
        path.join(process.cwd(), "content", "images.json"),
        "utf8",
      ),
    ) as Record<string, string>;
    const rel = manifest[key];
    if (!rel) return new Response("not found", { status: 404 });

    const file = path.join(process.cwd(), "public", rel.replace(/^\//, ""));
    const buf = await fs.readFile(file);
    const ext = (rel.split(".").pop() || "").toLowerCase();
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": TYPES[ext] ?? "application/octet-stream",
        // 60s 캐시 — next/image 옵티마이저가 이 주기로 원본을 재취득(교체 ~1분 내 반영).
        "Cache-Control": "public, max-age=60, must-revalidate",
      },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
