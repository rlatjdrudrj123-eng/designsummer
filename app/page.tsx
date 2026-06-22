import AuraSite from "@/components/aura/AuraSite";

/* 메인 `/` = 확정된 Aura 디자인(딜리버러블).
   실제 사이트 본문은 components/aura/ (AuraSite) + 콘텐츠(lib/conference, content/auraSpeakers.json, 업로드 이미지)에서 작업한다.
   /aura 는 동일 화면(작업/미리보기용) — 출시 전 정리.
   (이전 원본 SiteMain 은 /variants 의 "원본" 탭에 그대로 남아 있음.) */
export default function Home() {
  return (
    <main>
      <AuraSite />
    </main>
  );
}
