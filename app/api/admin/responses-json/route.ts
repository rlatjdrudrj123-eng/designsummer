import { checkAuth } from "@/lib/serverImages";
import { getDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

/* 임시 분석 도구 — responses(응답 원본)의 답안 배열만 반환.
   결과 분포 편향(여우·호랑이 미출현) 원인 진단·매핑 시뮬레이션용. 분석 후 제거. */
export async function GET(req: Request): Promise<Response> {
  if (!(await checkAuth(req))) {
    return new Response("unauthorized", { status: 401 });
  }
  const db = getDb();
  if (!db) return Response.json({ error: "no db" }, { status: 500 });
  try {
    const snap = await db.collection("responses").limit(3000).get();
    const rows = snap.docs.map((d) => {
      const v = d.data() as {
        animalId?: string | null;
        answers?: (number | null)[] | null;
      };
      return { a: v.animalId ?? null, ans: v.answers ?? [] };
    });
    return Response.json({ n: rows.length, rows });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
