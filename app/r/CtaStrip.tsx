"use client";

/* ============================================================================
 * /r 결과 페이지의 세션 CTA 스트립 — 외부(행사 신청) 링크 + cta 계측.
 *
 * 서버 컴포넌트(page.tsx)에서 마크업/클래스를 그대로 받아 렌더하고, 클릭 시
 * /api/track 로 cta 이벤트(animalId + 추천 섹션 A/B)를 fire-and-forget 전송한다.
 * 외부 이동이라 sendBeacon 우선, 실패 시 keepalive fetch 폴백. 실패는 무시.
 * ========================================================================== */

import type { ReactNode } from "react";

function track(animalId: string, section: "A" | "B") {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ event: "cta", animalId, section });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const ok = navigator.sendBeacon(
        "/api/track",
        new Blob([body], { type: "application/json" }),
      );
      if (ok) return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* 계측 실패 무시 */
  }
}

export default function CtaStrip({
  href,
  className,
  animalId,
  section,
  children,
}: {
  href: string;
  className: string;
  animalId: string;
  section: "A" | "B";
  children: ReactNode;
}) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track(animalId, section)}
    >
      {children}
    </a>
  );
}
