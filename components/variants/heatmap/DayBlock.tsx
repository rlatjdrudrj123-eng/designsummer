import Chapter from "./Chapter";
import Lineup from "./Lineup";
import CursorHeat from "./CursorHeat";

/* [HEATMAP 변형] 원본 components/sections/DayBlock.tsx 클론.
   하루 = 챕터(신청 CTA) + 라인업. 커서 열원(heatmap jet)이 구간을 감싼다. */
export default function DayBlock({ day }: { day: 1 | 2 }) {
  return (
    <CursorHeat day={day}>
      <Chapter day={day} />
      <Lineup day={day} />
    </CursorHeat>
  );
}
