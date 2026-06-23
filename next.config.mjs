/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 외부 터널(Cloudflare quick tunnel 등)에서 dev 리소스(_next/HMR) 접근 허용 — 외부 미리보기용
  allowedDevOrigins: ["*.trycloudflare.com", "*.loca.lt", "*.ngrok-free.app"],
  images: {
    // 업로드 교체가 사이트(옵티마이저 캐시)에 빨리 반영되도록 TTL 을 짧게.
    // (/api/img 라우트는 디스크를 새로 읽지만 next/image 가 결과를 캐싱해 stale 이 됨)
    minimumCacheTTL: 1,
  },
};

export default nextConfig;
