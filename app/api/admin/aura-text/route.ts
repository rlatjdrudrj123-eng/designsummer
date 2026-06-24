import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { checkAuth } from "@/lib/serverImages";

export const runtime = "nodejs";

/* /aura 전용 연사 텍스트 저장. content/auraSpeakers.json 에 id 별 필드 병합 후 기록.
   (이미지 라우트와 동일하게 x-forwarded-host 오리진 패턴으로 리다이렉트.) */

const STORE = path.join(process.cwd(), "content", "auraSpeakers.json");

type Override = {
  studio?: string;
  name?: string;
  role?: string;
  sessionTitle?: string;
  sessionDesc?: string;
  credentials?: string[];
  url?: string;
};

async function readStore(): Promise<Record<string, Override>> {
  try {
    return JSON.parse(await fs.readFile(STORE, "utf8"));
  } catch {
    return {};
  }
}

async function writeStore(data: Record<string, Override>) {
  const sorted = Object.fromEntries(
    Object.keys(data)
      .sort()
      .map((k) => [k, data[k]]),
  );
  await fs.writeFile(STORE, JSON.stringify(sorted, null, 2) + "\n");
}

export async function POST(req: Request) {
  const fwdHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const fwdProto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const origin = fwdHost ? `${fwdProto}://${fwdHost}` : new URL(req.url).origin;
  if (!(await checkAuth(req))) {
    return NextResponse.redirect(new URL("/admin/login", origin), 303);
  }

  const form = await req.formData();
  const id = String(form.get("id") ?? "").trim();
  if (id) {
    const credentials = String(form.get("credentials") ?? "")
      .split(/\r?\n/)
      .map((c) => c.trim())
      .filter(Boolean);
    const entry: Override = {
      studio: String(form.get("studio") ?? "").trim(),
      name: String(form.get("name") ?? "").trim(),
      role: String(form.get("role") ?? "").trim(),
      sessionTitle: String(form.get("sessionTitle") ?? "").trim(),
      sessionDesc: String(form.get("sessionDesc") ?? "").trim(),
      credentials,
      url: String(form.get("url") ?? "").trim(),
    };
    const store = await readStore();
    store[id] = { ...store[id], ...entry };
    await writeStore(store);
  }

  return NextResponse.redirect(new URL("/admin", origin), 303);
}
