import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

/* 영문·숫자 디스플레이 서체. --font-instrument 변수로 노출 →
   globals.css 의 --font-display 가 이를 참조 (가이드 5장). */
const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "디자인 썸머 일산",
  description:
    "K-PRINT 2026, 디자인 썸머 일산, 2026.08.20-08.21. KINTEX 제2전시장",
  openGraph: {
    title: "디자인 썸머 일산",
    description:
      "K-PRINT 2026, 디자인 썸머 일산, 2026.08.20-08.21. KINTEX 제2전시장",
    type: "website",
    url: "https://design-summer.kr/",
    siteName: "design-summer.kr",
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
        <script
          dangerouslySetInnerHTML={{
            // FOUT용 html.className 조작은 제거(React hydration 충돌 방지) — 폰트는 async 로드.
            __html:
              '(function(d){var config={kitId:"bln8piq",scriptTimeout:3000,async:true};var tk=d.createElement("script"),f=false,a;tk.src="https://use.typekit.net/"+config.kitId+".js";tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;try{Typekit.load(config)}catch(e){}};(d.head||d.getElementsByTagName("head")[0]).appendChild(tk);})(document);',
          }}
        />
        {/* Microsoft Clarity — 히트맵·세션 분석 (프로젝트 xba8fe7crb). */}
        <link rel="preconnect" href="https://www.clarity.ms" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","xba8fe7crb");',
          }}
        />
        {/* Google Analytics 4 (gtag) — 측정 ID G-FLZEZ9Z2MV. */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-FLZEZ9Z2MV"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-FLZEZ9Z2MV');",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
