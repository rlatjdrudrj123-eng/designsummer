/* 어드민 세션 토큰 — Edge(middleware) / Node(API 라우트) 양쪽에서 동작.
   node:crypto 대신 Web Crypto(crypto.subtle)만 사용해 미들웨어(Edge 런타임)와
   API 라우트(Node 런타임)에서 동일하게 import 가능. (node:fs 의존성을 끌어오지 않음)

   쿠키에는 ADMIN_PASSWORD 평문 대신 HMAC-SHA256 서명값(hex)만 저장한다.
   시크릿은 SESSION_SECRET 가 있으면 그것을, 없으면 ADMIN_PASSWORD 자체를 키로 쓴다.
   (ADMIN_PASSWORD 가 곧 비밀이므로 별도 시크릿이 없어도 평문 노출은 막을 수 있다.) */

const COOKIE_NAME = "ds_admin";

function hmacSecret(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** 현재 비밀번호에 대응하는 세션 토큰(hex). ADMIN_PASSWORD 미설정 시 빈 문자열. */
export async function sessionToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD || "";
  const secret = hmacSecret();
  if (!password || !secret) return "";
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    enc.encode(`${COOKIE_NAME}:v1:${password}`),
  );
  return toHex(sig);
}

/** 길이 누출 없는 상수시간 문자열 비교. */
export function timingSafeEqual(a: string, b: string): boolean {
  // 둘 다 동일 길이로 비교(빈 토큰 거부 포함). 길이가 다르면 즉시 false 지만
  // 입력 길이는 고정 hex 토큰이라 정보 누출이 없다.
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** 쿠키 토큰이 유효한 어드민 세션인지 검증. */
export async function verifySessionToken(token: string): Promise<boolean> {
  const expected = await sessionToken();
  if (!expected) return false;
  return timingSafeEqual(token, expected);
}

export { COOKIE_NAME };
