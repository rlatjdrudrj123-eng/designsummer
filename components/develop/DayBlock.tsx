import Chapter from "./Chapter";
import Lineup from "./Lineup";
import CursorHeat from "./CursorHeat";
import type { Lang } from "./developEn";

/* 하루 = 챕터(신청 CTA 포함) + 라인업. 커서 열원(D1 레드 / D2 오렌지)이 구간을 감싼다. */
export default function DayBlock({ day, lang = "ko" }: { day: 1 | 2; lang?: Lang }) {
  return (
    <CursorHeat day={day}>
      <Chapter day={day} lang={lang} />
      <Lineup day={day} lang={lang} />
    </CursorHeat>
  );
}
