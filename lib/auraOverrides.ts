import "server-only";
import { getDb } from "@/lib/firebaseAdmin";
import {
  bundledOverrides,
  type AuraOverride,
  type AuraOverrideMap,
} from "@/lib/auraContent";

/* Aura 연사 텍스트 override 의 영구 저장소(Firestore).
   App Hosting 은 파일시스템이 휘발성이라 content/auraSpeakers.json 에 쓰면 배포·재시작
   시 사라진다. 그래서 어드민 수정분은 Firestore 단일 문서 content/auraSpeakers 에
   { overrides: { [id]: {...} } } 형태로 저장하고, 사이트는 번들 JSON(마지막 배포 기준선)
   위에 이 Firestore override 를 얹어 읽는다.

   공개 페이지(/, /r)는 ISR(revalidate=300) + 저장 시 revalidatePath 로 갱신하므로
   여기서 별도 캐시는 두지 않는다(요청마다 읽지 않고 재생성 시에만 읽힘). */

const DOC = "content/auraSpeakers";

/** 번들 기준선 + Firestore override 병합. */
export async function readAuraOverrides(): Promise<AuraOverrideMap> {
  const db = getDb();
  if (!db) return bundledOverrides;
  try {
    const snap = await db.doc(DOC).get();
    const fs = (
      snap.data() as { overrides?: AuraOverrideMap } | undefined
    )?.overrides;
    if (!fs) return bundledOverrides;
    return { ...bundledOverrides, ...fs };
  } catch {
    return bundledOverrides;
  }
}

/* 공개 페이지(/ , /aura)는 force-dynamic 이라 요청마다 호출된다. 스파이크 시 매
   요청 Firestore 직격을 막기 위해 인스턴스별 짧은 메모리 캐시(10초)를 둔다.
   어드민(readAuraOverrides)은 캐시 없이 항상 최신값을 읽는다. */
const MEMO_TTL_MS = 10_000;
let memo: { at: number; data: AuraOverrideMap } | null = null;

export async function getAuraOverrides(): Promise<AuraOverrideMap> {
  const now = Date.now();
  if (memo && now - memo.at < MEMO_TTL_MS) return memo.data;
  const data = await readAuraOverrides();
  memo = { at: now, data };
  return data;
}

/** 한 연사 id 의 override 를 Firestore 에 병합 저장. 성공 시 true. */
export async function writeAuraOverride(
  id: string,
  entry: AuraOverride,
): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    await db.doc(DOC).set({ overrides: { [id]: entry } }, { merge: true });
    return true;
  } catch {
    return false;
  }
}
