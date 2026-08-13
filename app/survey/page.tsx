import { redirect } from "next/navigation";

/* /survey — 뉴스레터 랜딩용 짧은 URL.
   홈(/?survey=1)으로 보내면 AnimalTest 가 진입 즉시 테스트 모달을 자동 오픈한다. */
export default function SurveyPage() {
  redirect("/?survey=1");
}
