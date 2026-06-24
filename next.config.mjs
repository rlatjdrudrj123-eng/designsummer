/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 외부 터널(Cloudflare quick tunnel 등)에서 dev 리소스(_next/HMR) 접근 허용 — 외부 미리보기용
  allowedDevOrigins: ["*.trycloudflare.com", "*.loca.lt", "*.ngrok-free.app"],
  images: {
    // 최적화 ON — next/image 가 디바이스 폭에 맞춰 리사이즈 + AVIF/WebP 변환(원본이 커도
    // 클라이언트엔 작게 전송). 출시용 성능. minimumCacheTTL 을 60s 로 둬서 교체 업로드도
    // 1분 내(새로고침 시) 반영되도록 절충.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
