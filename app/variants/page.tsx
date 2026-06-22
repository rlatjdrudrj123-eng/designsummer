"use client";

import { useEffect, useState } from "react";
import SiteMain from "@/components/SiteMain";
import Spark from "@/components/variants/spark/Spark";
import Heatwave from "@/components/variants/heatwave/Heatwave";
import Hand from "@/components/variants/hand/Hand";
import Thermal from "@/components/variants/thermal/Thermal";
import Report from "@/components/variants/report/Report";
import Aura from "@/components/variants/aura/Aura";
import Liquid from "@/components/variants/liquid/Liquid";
import Sheet from "@/components/variants/sheet/Sheet";
import Heatmap from "@/components/variants/heatmap/Heatmap";
import Process from "@/components/variants/process/Process";
import styles from "./variants.module.css";

/* 비주얼 방향 비교용 — 원본(메인) + 7개 비주얼 변형을 상단 탭으로 전환.
   (별도 URL 없이 한 페이지에서 비교) */
const TABS = [
  { key: "main", label: "원본", node: <SiteMain /> },
  { key: "spark", label: "1 · Spark", node: <Spark /> },
  { key: "heatwave", label: "2 · Heatwave", node: <Heatwave /> },
  { key: "hand", label: "3 · Hand", node: <Hand /> },
  { key: "thermal", label: "4 · Thermal", node: <Thermal /> },
  { key: "report", label: "6 · Report", node: <Report /> },
  { key: "aura", label: "7 · Aura", node: <Aura /> },
  { key: "liquid", label: "8 · Liquid", node: <Liquid /> },
  { key: "sheet", label: "9 · Sheet", node: <Sheet /> },
  { key: "heatmap", label: "10 · Heatmap", node: <Heatmap /> },
  { key: "process", label: "11 · CMYK", node: <Process /> },
] as const;

export default function VariantsPage() {
  const [active, setActive] = useState(0);

  // #spark / #heatwave / #hand 로 진입 탭 지정 (딥링크·캡처용)
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
      <nav className={styles.tabs} aria-label="비주얼 변형">
        <span className={styles.brand}>Design Summer · 비주얼 시안</span>
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
