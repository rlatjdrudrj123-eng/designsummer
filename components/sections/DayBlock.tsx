import Chapter from "./Chapter";
import Lineup from "./Lineup";
import CursorHeat from "@/components/scroll/CursorHeat";

/* 하루 = 챕터(신청 CTA 포함) + 라인업. 커서 열원(D1 레드 / D2 오렌지)이 구간을 감싼다. */
export default function DayBlock({ day }: { day: 1 | 2 }) {
  return (
    <CursorHeat day={day}>
      <Chapter day={day} />
      <Lineup day={day} />
    </CursorHeat>
  );
}
