import Lineup from "./Lineup";
import CursorHeat from "./CursorHeat";

/* [LIQUID 변형] 하루치 라인업(연사 카드)을 커서 열원(액상 무지개)으로 감싼다.
   행사 개요/컨셉은 별도 About 섹션으로 분리되어, 여기서는 라인업만 렌더한다. */
export default function DayBlock({ day }: { day: 1 | 2 }) {
  return (
    <CursorHeat day={day}>
      <Lineup day={day} />
    </CursorHeat>
  );
}
