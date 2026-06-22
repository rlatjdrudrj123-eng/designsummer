"use client";

import { useEffect, useState } from "react";
import DevelopSite from "@/components/develop/DevelopSite";
import ConceptEditorial from "@/components/develop/conceptEditorial/ConceptEditorial";
import ConceptIndex from "@/components/develop/conceptIndex/ConceptIndex";
import ConceptStage from "@/components/develop/conceptStage/ConceptStage";
import BrutalistPage from "@/components/develop/c1Brutalist/BrutalistPage";
import TerminalPage from "@/components/develop/c2Terminal/TerminalPage";
import RisoPage from "@/components/develop/c3Riso/RisoPage";
import SerifPage from "@/components/develop/c4Serif/SerifPage";
import KineticPage from "@/components/develop/c5Kinetic/KineticPage";
import styles from "./develop.module.css";

/* /develop — 버전·컨셉 비교용 탭 페이지.
   앞쪽 3개 = 같은 레이아웃의 배경/언어 변형(DevelopSite).
   나머지 = 차별화된 컨셉 풀페이지(각자 컴포넌트 자급자족, 페이지 내 컨셉 설명 표기). */
const TABS = [
  { key: "aura", label: "01 Aura", node: <DevelopSite aura /> },
  { key: "plain", label: "02 Plain", node: <DevelopSite aura={false} /> },
  { key: "en", label: "03 English", node: <DevelopSite lang="en" aura /> },
  { key: "editorial", label: "04 Editorial", node: <ConceptEditorial /> },
  { key: "index", label: "05 Index", node: <ConceptIndex /> },
  { key: "stage", label: "06 Stage", node: <ConceptStage /> },
  { key: "brutalist", label: "07 Brutalist", node: <BrutalistPage /> },
  { key: "terminal", label: "08 Terminal", node: <TerminalPage /> },
  { key: "riso", label: "09 Riso", node: <RisoPage /> },
  { key: "serif", label: "10 Serif", node: <SerifPage /> },
  { key: "kinetic", label: "11 Kinetic", node: <KineticPage /> },
] as const;

export default function DevelopPage() {
  const [active, setActive] = useState(0);

  // #key 로 진입 탭 지정 (딥링크·캡처용)
  useEffect(() => {
    const i = TABS.findIndex((t) => t.key === window.location.hash.slice(1));
    if (i >= 0) setActive(i);
  }, []);

  const select = (i: number) => {
    setActive(i);
    if (typeof window !== "undefined") {
      history.replaceState(null, "", `#${TABS[i].key}`);
    }
  };

  return (
    <div className={styles.page}>
      <nav className={styles.tabs} aria-label="develop 버전·컨셉">
        <span className={styles.brand}>Design Summer · develop</span>
        <div className={styles.tabList}>
          {TABS.map((t, i) => (
            <button
              key={t.key}
              className={`${styles.tab} ${i === active ? styles.tabOn : ""}`}
              onClick={() => select(i)}
              aria-pressed={i === active}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>
      <main className={styles.stage}>{TABS[active].node}</main>
    </div>
  );
}
