import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

/* 영문·숫자 디스플레이 서체. --font-instrument 변수로 노출 →
   globals.css 의 --font-display 가 이를 참조 (가이드 5장). */
const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument",
  display: "swap",
});

/* SEO 메타 — 한국어 검색 의도 키워드를 타이틀/설명에 자연스럽게 반영.
   타이틀 = 브랜드("디자인 썸머 일산") + 핵심 키워드("디자인 세미나 2026 · K-PRINT 디자인 컨퍼런스").
   설명 = 라이브 카피(conference.ts)에서 도출한 사실(슬로건·날짜·장소·가격·연사 8인)만 사용. */
const SITE_TITLE =
  "디자인 썸머 일산 | 디자인 세미나 2026 · K-PRINT 디자인 컨퍼런스";
const SITE_DESC =
  "디자인 썸머 일산 — the creative heatwave. 2026.08.20(목)~08.21(금) KINTEX 제2전시장, 디자이너·브랜딩·인쇄 실무 스페셜리스트 8인의 디자인 세미나. 브랜딩·모션그래픽·AI·박인쇄·패턴 출력 등 실무 인사이트. 얼리버드 20,000원(1일권).";

export const metadata: Metadata = {
  metadataBase: new URL("https://design-summer.kr"),
  title: {
    default: SITE_TITLE,
    template: "%s | 디자인 썸머 일산",
  },
  description: SITE_DESC,
  keywords: [
    "디자인 썸머",
    "디자인 썸머 일산",
    "디자인 세미나 2026",
    "디자인 컨퍼런스",
    "K-PRINT 디자인 컨퍼런스",
    "킨텍스 디자인 세미나",
    "인쇄 세미나",
    "브랜딩 세미나",
    "모션그래픽 세미나",
    "박인쇄",
    "패턴 디자인",
    "K-PRINT 2026",
  ],
  applicationName: "디자인 썸머 일산",
  authors: [{ name: "한국이앤엑스 K-PRINT 사무국", url: "https://kprint.kr/" }],
  creator: "한국이앤엑스 K-PRINT 사무국",
  publisher: "한국이앤엑스 K-PRINT 사무국",
  alternates: {
    canonical: "/",
  },
  /* 검색엔진 소유 확인(verification) — 공개·정적 토큰이라 직접 명시한다.
       - Google: Search Console > HTML 태그
       - Naver:  서치어드바이저 > 사이트 등록 > 메타태그
     other.naver-site-verification 으로 <meta name="naver-site-verification"> 를 출력한다. */
  verification: {
    google: "I9Q7Vfb_uaHWb9X4dRZG_XoyG0piGJJsOgX62ygEeBs",
    other: {
      "naver-site-verification": "4550c584fe3be88331331f328a144a5cb9b7718f",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESC,
    type: "website",
    url: "https://design-summer.kr/",
    siteName: "디자인 썸머 일산",
    locale: "ko_KR",
    images: [
      {
        url: "/preview-v2.png",
        width: 1000,
        height: 500,
        alt: "디자인 썸머 일산 — K-PRINT 2026 디자인 세미나",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ["/preview-v2.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={instrument.variable}>
      <head>
        {/* 한글 디스플레이·본문: Pretendard Variable (CDN) */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        {/* 타이틀 디스플레이: 210 옴니고딕 (Adobe Fonts 웹킷 bln8piq) — font-family "omnigothic", 200~600.
            이 킷은 CSS 임베드(.css)가 412라서 JS 로더(.js, Adobe 제공 스니펫)로 로드한다.
            웹 프로젝트는 도메인 제한이 없어 어느 도메인에서나 동작. */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        {/* Typekit 의 실제 폰트 파일은 p.typekit.net 에서 서빙된다 — 핸드셰이크
            지연을 줄이도록 origin 을 미리 연결(LCP 타이틀 서체 omnigothic 가속, 비가시). */}
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            // FOUT용 html.className 조작은 제거(React hydration 충돌 방지) — 폰트는 async 로드.
            __html:
              '(function(d){var config={kitId:"bln8piq",scriptTimeout:3000,async:true};var tk=d.createElement("script"),f=false,a;tk.src="https://use.typekit.net/"+config.kitId+".js";tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;try{Typekit.load(config)}catch(e){}};(d.head||d.getElementsByTagName("head")[0]).appendChild(tk);})(document);',
          }}
        />
        {/* 분석 스크립트 origin 은 미리 연결만(스크립트 자체는 afterInteractive 로 지연). */}
        <link rel="preconnect" href="https://www.clarity.ms" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
      </head>
      <body>
        {children}

        {/* ── 분석 — 초기 렌더 경로에서 분리(afterInteractive). 하이드레이션 후 로드돼
            FCP/LCP·대역폭 경합을 줄인다. ───────────────────────────────────────── */}
        {/* Microsoft Clarity (프로젝트 xba8fe7crb) */}
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","xba8fe7crb");`}
        </Script>
        {/* Google Analytics 4 (gtag) — 측정 ID G-FLZEZ9Z2MV */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FLZEZ9Z2MV"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-FLZEZ9Z2MV');`}
        </Script>
      </body>
    </html>
  );
}
