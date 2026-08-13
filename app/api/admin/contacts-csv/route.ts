import { checkAuth } from "@/lib/serverImages";
import { getDb } from "@/lib/firebaseAdmin";
import { ANIMALS, SWAN, type AnimalId } from "@/lib/animalTest";

export const runtime = "nodejs";

/* 쿠폰 응모자 명단 CSV 다운로드(어드민 전용).
   엑셀에서 한글이 깨지지 않도록 UTF-8 BOM 을 붙인다. */

function animalName(id: string | null): string {
  if (!id) return "";
  if (id === "swan") return SWAN.name;
  const a = ANIMALS[id as Exclude<AnimalId, "swan">];
  return a ? a.name : id;
}

/** CSV 셀 이스케이프 — 콤마/따옴표/개행 포함 시 큰따옴표로 감싼다.
    선행 =,+,-,@ 는 스프레드시트 수식 주입 방지로 앞에 ' 를 붙인다. */
function cell(v: string): string {
  let s = v ?? "";
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request): Promise<Response> {
  if (!(await checkAuth(req))) {
    return new Response("unauthorized", { status: 401 });
  }
  const db = getDb();
  if (!db) return new Response("no db", { status: 500 });

  try {
    const snap = await db
      .collection("contacts")
      .orderBy("t", "desc")
      .limit(5000)
      .get();

    const fmt = new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: "Asia/Seoul",
    });

    const lines = ["번호,이름,휴대폰,결과 유형,응모 시각"];
    snap.docs.forEach((d, i) => {
      const v = d.data() as {
        name?: string;
        phone?: string;
        animalId?: string | null;
        t?: { toDate?: () => Date };
      };
      let at = "";
      try {
        const dt = v.t?.toDate?.();
        if (dt) at = fmt.format(dt);
      } catch {
        /* ignore */
      }
      lines.push(
        [
          String(i + 1),
          cell(v.name ?? ""),
          cell(v.phone ?? ""),
          cell(animalName(v.animalId ?? null)),
          cell(at),
        ].join(","),
      );
    });

    // 파일명에 날짜(KST) 표기
    const today = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Seoul",
    }).format(new Date());
    const body = "﻿" + lines.join("\r\n"); // BOM + CRLF(엑셀 호환)

    return new Response(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="design-summer-coupon-${today}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new Response(`error: ${(e as Error).message}`, { status: 500 });
  }
}
