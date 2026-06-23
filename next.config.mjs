/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 외부 터널(Cloudflare quick tunnel 등)에서 dev 리소스(_next/HMR) 접근 허용 — 외부 미리보기용
  allowedDevOrigins: ["*.trycloudflare.com", "*.loca.lt", "*.ngrok-free.app"],
  images: {
    // next/image 옵티마이저 캐시가 업로드 '교체'를 stale 하게 잡아(로컬·터널에서)
    // 반영이 안 되던 문제 → 최적화를 끄고 브라우저가 /api/img 라우트를 직접 로드.
    // 라우트는 디스크를 새로 읽고 Cache-Control max-age=1 이라 교체가 새로고침 시 바로 반영.
    // (이미지는 적정 크기로 업로드 권장 — 어드민 슬롯별 권장 사이즈 참고)
    unoptimized: true,
  },
};

export default nextConfig;
