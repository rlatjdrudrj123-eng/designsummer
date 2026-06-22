/* public/uploads 를 스캔해 content/images.json(키→URL)을 갱신.
   확장자(jpg/png/webp) 무관, 파일명 규칙: kv.* / speaker-{id}.* / poster-{id}.*
   사진을 드롭한 뒤 `npm run sync-images` 실행. (dev 서버는 JSON 변경 시 자동 반영) */
import { readdirSync, writeFileSync, existsSync } from "node:fs";

const DIR = "public/uploads";
const OUT = "content/images.json";

const map = {};
if (existsSync(DIR)) {
  for (const f of readdirSync(DIR)) {
    const m = f.match(
      /^((?:speaker|poster|work)-[a-z0-9]+(?:-[0-9]+)?|kv)\.(png|jpe?g|webp)$/i,
    );
    if (m) map[m[1]] = `/uploads/${f}`;
  }
}
const sorted = Object.fromEntries(Object.keys(map).sort().map((k) => [k, map[k]]));
writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
console.log(`synced ${Object.keys(sorted).length} image(s) → ${OUT}`);
for (const [k, v] of Object.entries(sorted)) console.log(`  ${k} → ${v}`);
