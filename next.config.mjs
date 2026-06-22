/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 외부 터널(Cloudflare quick tunnel 등)에서 dev 리소스(_next/HMR) 접근 허용 — 외부 미리보기용
  allowedDevOrigins: ["*.trycloudflare.com", "*.loca.lt", "*.ngrok-free.app"],
};

export default nextConfig;
