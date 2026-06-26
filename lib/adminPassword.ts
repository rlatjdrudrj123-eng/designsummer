import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { getDb } from "@/lib/firebaseAdmin";

/* 어드민 비밀번호의 영구 저장소(Firestore admin/auth).
   비번 변경 기능을 위해 env(ADMIN_PASSWORD) 대신 Firestore 에 salt+hash 로 저장한다.
   Firestore 에 값이 없으면 env(ADMIN_PASSWORD)로 폴백 — 최초 부트스트랩.

   이 파일은 node 런타임 전용(API 라우트)이다. 미들웨어(Edge)는 Firestore 를 못 읽으므로
   세션 토큰 검증은 lib/adminAuth.ts(SESSION_SECRET 기반, 비번 비의존)가 담당한다. */

const DOC = "admin/auth";

function sha256(salt: string, pw: string): string {
  return createHash("sha256").update(`${salt}:${pw}`).digest("hex");
}

/** 길이 누출 없는 상수시간 hex 비교. */
function safeEqHex(a: string, b: string): boolean {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** 입력 비번이 맞는지 검증. Firestore 해시 우선, 없으면 env 폴백. */
export async function verifyAdminPassword(pw: string): Promise<boolean> {
  if (!pw) return false;
  const db = getDb();
  if (db) {
    try {
      const snap = await db.doc(DOC).get();
      const d = snap.data() as
        | { salt?: string; hash?: string }
        | undefined;
      if (d?.salt && d?.hash) {
        return safeEqHex(sha256(d.salt, pw), d.hash);
      }
    } catch {
      /* Firestore 오류 시 env 폴백으로 진행 */
    }
  }
  // 폴백: Firestore 미설정 시 env ADMIN_PASSWORD 로 부트스트랩
  const env = process.env.ADMIN_PASSWORD || "";
  return env.length > 0 && pw === env;
}

/** 새 비번을 Firestore 에 salt+hash 로 저장. 성공 시 true. */
export async function setAdminPassword(pw: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    const salt = randomBytes(16).toString("hex");
    await db.doc(DOC).set({
      salt,
      hash: sha256(salt, pw),
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch {
    return false;
  }
}
