/* ============================================================================
 * firebase-admin (Firestore) 지연 싱글톤.
 *
 * 호스팅(Firebase App Hosting = Cloud Run)은 런타임에 ADC(Application Default
 * Credentials)와 프로젝트ID를 제공하므로, 키파일 없이 initializeApp() 무인자로
 * Firestore 에 접근한다. 로컬/빌드 환경엔 자격증명이 없을 수 있으므로 모든
 * 초기화를 try/catch 로 감싸고 실패 시 null 을 반환한다 → 호출부는 no-op.
 *
 * 통계는 Cloud Run FS 가 ephemeral 이라 반드시 Firestore 에 적재한다.
 * ========================================================================== */

import { getApps, getApp, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// 한 번 실패하면 매 요청마다 재시도해 로그를 더럽히지 않도록 결과를 캐시한다.
let cached: Firestore | null | undefined;

/**
 * Firestore 인스턴스(있으면). 자격증명/초기화 실패 시 null.
 * 호출부는 null 이면 조용히 통계 기록·조회를 건너뛴다(로컬에선 정상).
 */
export function getDb(): Firestore | null {
  if (cached !== undefined) return cached;
  try {
    // 프로젝트를 명시적으로 박는다 — App Hosting 런타임에서 GOOGLE_CLOUD_PROJECT 가
    // 비어 있어 Firestore 가 프로젝트를 추측하다 (default) DB 를 못 찾는(5 NOT_FOUND)
    // 문제를 막는다. projectId 는 FIREBASE_CONFIG 에서 우선 파싱.
    let projectId: string | undefined;
    try {
      projectId = process.env.FIREBASE_CONFIG
        ? JSON.parse(process.env.FIREBASE_CONFIG).projectId
        : undefined;
    } catch {
      /* ignore */
    }
    projectId =
      projectId ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCLOUD_PROJECT ||
      undefined;
    const app: App = getApps().length
      ? getApp()
      : initializeApp(projectId ? { projectId } : undefined);
    cached = getFirestore(app);
  } catch {
    cached = null;
  }
  return cached;
}
