"use client";

/* ============================================================================
 * AnimalTest — 디자이너 동물상 × 크리에이티브 온도 (메인 `/` · Benefits 직후)
 *
 * 구조: 페이지엔 "진입 요소"(임팩트 있는 단 하나)만 둔다 — 따뜻한 크림 그라운드
 * 위에 텍스트(좌) + 끓는 열덩이(우). CTA 클릭 시 모달이 열리고, 실제 테스트는
 * 모달 안에서 진행한다: 문항(17개, 하나씩, 진행률) → 리빌(열덩이 깨기) → 결과.
 *
 * 진입 요소가 인트로 역할을 하므로 모달은 바로 문항부터 시작한다.
 * 데이터/스코어링/카피는 lib/animalTest.ts 그대로. 모션은 CSS + 간단 setState만.
 * 모달은 createPortal + 순수 React(포커스 트랩/ESC/스크롤락/백드롭) — 라이브러리 X.
 * ========================================================================== */

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import styles from "./AnimalTest.module.css";
import Reveal from "@/components/develop/Reveal";
import { siteContent } from "@/lib/content";
import {
  QUESTIONS,
  scoreTest,
  SURVEY_QUESTIONS,
  TEST_COPY,
  type Animal,
} from "@/lib/animalTest";

type Phase = "quiz" | "reveal" | "result";

/* ── 통계 계측(자체 Firestore) ─────────────────────────────────────────────
   fire-and-forget. sendBeacon 우선(외부 이동·언로드에도 전송 보장), 실패 시
   keepalive fetch 폴백. UI 를 절대 블록하지 않고, 어떤 실패도 무시한다. */
function track(event: "start" | "complete" | "share" | "cta", payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ event, ...payload });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const ok = navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      if (ok) return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* 계측 실패는 무시 — 사용자 경험에 영향 없음 */
  }
}

const CRACKS_TO_BREAK = 10; // 열구 깨는 데 필요한 탭 횟수
// 탭마다 방사형으로 튀는 스파크 각도(도) — 균등 분포 + 살짝 흐트러뜨려 자연스럽게.
const SPARKS = [8, 52, 96, 140, 184, 228, 272, 316];

/* 퀴즈 플로우 스텝 — 설문[0](분야) → 채점 10문항 → 설문[1](인지) → 설문[2](관심).
   설문은 결과 산출에 영향 없음(SURVEY_QUESTIONS 참조). */
type QuizStep = { kind: "scored"; qi: number } | { kind: "survey"; si: number };
const STEPS: QuizStep[] = [
  { kind: "survey", si: 0 },
  ...QUESTIONS.map((_, qi): QuizStep => ({ kind: "scored", qi })),
  { kind: "survey", si: 1 },
  { kind: "survey", si: 2 },
];

/* 진입부 미리보기 폴 — 서버(lib/testStats)가 Firestore 응답 분포에서 산출해 내려줌.
   문항·보기 텍스트는 테스트 원문 그대로, 응답률(%)만 라이브. 참여자 수는 비노출. */
export type TeaserPoll = {
  q: string;
  options: { label: string; pct: string; top: boolean }[];
};

export default function AnimalTest({
  polls = null,
}: {
  polls?: TeaserPoll[] | null;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const openModal = () => setOpen(true);
  const closeModal = useCallback(() => {
    setOpen(false);
    // 닫을 때 진입 CTA로 포커스 복귀
    triggerRef.current?.focus();
  }, []);

  // 뉴스레터 랜딩(/survey → /?survey=1): 진입 즉시 테스트 모달 자동 오픈.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("survey") === "1") {
      setOpen(true);
    }
  }, []);

  return (
    <section
      id="animaltest"
      className={`${styles.section} shell`}
      aria-labelledby="animaltest-heading"
    >
      <Reveal>
        {/* ── 진입 요소: 텍스트(좌) + 끓는 열덩이(우) ─────────────────────── */}
        <div className={styles.entry}>
          <div className={styles.entryText}>
            <h2 id="animaltest-heading" className={styles.title}>
              당신의 크리에이티브, 지금 몇 도?
            </h2>
            <button
              ref={triggerRef}
              type="button"
              className={styles.entryCta}
              onClick={openModal}
            >
              내 온도 알아보기 <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className={styles.entryVisual} aria-hidden="true">
            <span className={styles.heatBlob}>
              <span className={styles.heatBlobCore} />
            </span>
          </div>
        </div>

        {/* ── 미리보기 폴 — 실제 문항 + 실시간 응답률(숫자만 라이브) ────────── */}
        {polls && polls.length > 0 && (
          <div className={styles.polls}>
            {polls.map((p, i) => (
              <div key={i} className={styles.poll}>
                <p className={styles.pollLive}>
                  <span className={styles.liveDot} aria-hidden="true" />
                  실시간 응답
                </p>
                <p className={styles.pollQ}>{p.q}</p>
                <ul className={styles.pollList}>
                  {p.options.map((o, j) => (
                    <li
                      key={j}
                      className={`${styles.pollRow} ${o.top ? styles.pollTop : ""}`}
                    >
                      <span className={styles.pollLabel}>{o.label}</span>
                      <span className={styles.pollMeter}>
                        <span className={styles.pollTrack}>
                          <span
                            className={styles.pollFill}
                            style={{ width: `${o.pct}%` }}
                          />
                        </span>
                        <span className={styles.pollPct}>{o.pct}%</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Reveal>

      {open && <TestModal onClose={closeModal} />}
    </section>
  );
}

/* ============================================================================
 * TestModal — 오버레이에서 테스트 실행. 포털로 body 직속에 렌더.
 * ========================================================================== */
function TestModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  const [phase, setPhase] = useState<Phase>("quiz");
  const [step, setStep] = useState(0); // STEPS 인덱스
  const [answers, setAnswers] = useState<number[]>([]); // 채점 문항(qi 인덱스) 답
  // 설문 답(문항별 선택 인덱스 배열 — 단일 선택은 길이 1)
  const [surveyAnswers, setSurveyAnswers] = useState<number[][]>([[], [], []]);
  const [result, setResult] = useState<Animal | null>(null);

  // reveal(열구) 상태
  const [taps, setTaps] = useState(0);
  // pulse: 탭마다 단조 증가하는 카운터. 같은 값을 다시 눌러도(예: 균열 표시는
  // taps 기준이라 변화 없을 수 있음) 펀치/스파크 애니메이션을 매번 재생시키기
  // 위한 트리거. 인라인 style 의 --pulse 키 + 스파크 노드 key 로 쓴다.
  const [pulse, setPulse] = useState(0);
  const [breaking, setBreaking] = useState(false);
  const [toast, setToast] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = "animaltest-modal-title";

  useEffect(() => setMounted(true), []);

  // 테스트 시작 계측 — 모달이 열려 마운트될 때 1회.
  useEffect(() => {
    track("start");
  }, []);

  // body 스크롤 잠금 + 첫 포커스 이동 + ESC + 포커스 트랩
  useEffect(() => {
    if (!mounted) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    // 오픈 시 다이얼로그(또는 첫 포커서블)로 포커스 이동
    dialog?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const focusables = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || active === dialog) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted, onClose]);

  // 단계가 바뀌면 새 콘텐츠 시작점으로 포커스 (스크린리더/키보드 흐름).
  useEffect(() => {
    if (!mounted) return;
    dialogRef.current?.focus();
  }, [phase, step, mounted]);

  // 마지막 스텝(설문[2]) 통과 → 결과 산출 + 완료 계측 + 열구 리빌.
  const finish = (sv: number[][], scoredAnswers: number[]) => {
    const scored = scoreTest(scoredAnswers);
    setResult(scored);
    // 완료 계측 — 채점 answers + 결과 동물 + 비채점 설문 답.
    track("complete", {
      answers: scoredAnswers,
      animalId: scored.id,
      survey: {
        field: sv[0],
        aware: sv[1][0] ?? null,
        interests: sv[2],
      },
    });
    setTaps(0);
    setPulse(0);
    setBreaking(false);
    setPhase("reveal");
  };

  const stepDef = STEPS[step];

  // 채점 문항 선택 — 즉시 다음 스텝(채점 문항 뒤엔 항상 설문이 있어 finish 아님).
  const choose = (choiceIndex: number) => {
    if (stepDef.kind !== "scored") return;
    const next = [...answers];
    next[stepDef.qi] = choiceIndex;
    setAnswers(next);
    setStep(step + 1);
  };

  // 설문 다음/완료 — 마지막 스텝이면 finish.
  const advanceSurvey = (sv: number[][]) => {
    if (step + 1 < STEPS.length) setStep(step + 1);
    else finish(sv, answers);
  };

  // 설문 선택 — 복수는 토글(max 캡), 단일은 선택 즉시 다음으로.
  const toggleSurvey = (choiceIndex: number) => {
    if (stepDef.kind !== "survey") return;
    const sq = SURVEY_QUESTIONS[stepDef.si];
    const next = surveyAnswers.map((a) => [...a]);
    const cur = next[stepDef.si];
    if (sq.multi) {
      const at = cur.indexOf(choiceIndex);
      if (at >= 0) cur.splice(at, 1);
      else if (cur.length < sq.max) cur.push(choiceIndex);
      setSurveyAnswers(next);
    } else {
      next[stepDef.si] = [choiceIndex];
      setSurveyAnswers(next);
      advanceSurvey(next);
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const tapBlob = () => {
    if (breaking) return;
    const t = taps + 1;
    setTaps(t);
    setPulse((p) => p + 1); // 같은 결과여도 펀치/스파크 매번 재생

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (t >= CRACKS_TO_BREAK) {
      setBreaking(true);
      // 깨질 때 더 강한 햅틱(짧은 더블 펄스). 미지원이면 optional chaining 으로 무시.
      if (!reduce) navigator.vibrate?.([30, 40, 70]);
      window.setTimeout(() => setPhase("result"), reduce ? 200 : 900);
    } else if (!reduce) {
      // 탭마다 가벼운 햅틱 — 후반으로 갈수록 살짝 강하게(6~24ms).
      navigator.vibrate?.(Math.round(6 + (t / CRACKS_TO_BREAK) * 18));
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers([]);
    setSurveyAnswers([[], [], []]);
    setResult(null);
    setTaps(0);
    setPulse(0);
    setBreaking(false);
    setToast(false);
    setPhase("quiz");
  };

  const share = async () => {
    // 공유 계측 — 결과 동물 id.
    if (result) track("share", { animalId: result.id });
    // 결과가 담긴 전용 링크(/r?a={동물 id}) — 카톡/트위터에 동적 OG 카드가 뜬다.
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://design-summer.kr";
    const url = result ? `${origin}/r?a=${result.id}` : origin;
    const text = result
      ? `나 "${result.name}" 나왔어 — 크리에이티브 온도 ${result.tempLabel}°C 🔥\n너도 1분이면 나옴, 무슨 동물인지 해봐 👇`
      : "디자이너 동물상 테스트 — 내 크리에이티브 온도는 몇 도?";

    // 모바일: 네이티브 공유 시트(카톡·인스타 등 바로 선택). 미지원/취소 시 클립보드 폴백.
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "디자이너 동물상 테스트", text, url });
        return;
      } catch (e) {
        // 사용자가 취소(AbortError)면 조용히 종료, 그 외엔 클립보드로 폴백.
        if ((e as Error)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast(true);
      window.setTimeout(() => setToast(false), 2000);
    } catch {
      window.prompt("아래 링크를 복사해 공유하세요", url);
    }
  };

  if (!mounted) return null;

  return createPortal(
    // 배경(스크림) 클릭으로는 닫지 않는다 — 13스텝 진행 중 실수 클릭 한 번에
    // 답이 날아가는 사고 방지. 닫기는 X 버튼·ESC 로만.
    <div className={styles.scrim}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <h2 id={titleId} className="srOnly">
          {TEST_COPY.title} 테스트
        </h2>

        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="테스트 닫기"
        >
          ✕
        </button>

        {/* ── 퀴즈 (채점 문항 + 비채점 설문 스텝) ───────────────────────── */}
        {phase === "quiz" && (
          <div className={styles.quiz}>
            <div className={styles.progress}>
              <div className={styles.progressBar}>
                <span
                  className={styles.progressFill}
                  style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                />
              </div>
              <span className={styles.progressText}>
                {step + 1} / {STEPS.length}
              </span>
            </div>

            {stepDef.kind === "scored" ? (
              <>
                <h3 className={styles.question}>{QUESTIONS[stepDef.qi].q}</h3>
                <ul className={styles.choices}>
                  {QUESTIONS[stepDef.qi].choices.map((c, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        className={styles.choice}
                        onClick={() => choose(i)}
                      >
                        {c.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              (() => {
                const sq = SURVEY_QUESTIONS[stepDef.si];
                const sel = surveyAnswers[stepDef.si];
                return (
                  <>
                    <h3 className={styles.question}>
                      {sq.q}
                      {sq.hint && (
                        <span className={styles.surveyHint}>{sq.hint}</span>
                      )}
                    </h3>
                    <ul className={styles.choices}>
                      {sq.options.map((label, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            className={`${styles.choice} ${
                              sel.includes(i) ? styles.choiceOn : ""
                            }`}
                            aria-pressed={sel.includes(i)}
                            onClick={() => toggleSurvey(i)}
                          >
                            {label}
                          </button>
                        </li>
                      ))}
                    </ul>
                    {sq.multi && (
                      <button
                        type="button"
                        className={styles.surveyNext}
                        disabled={sel.length === 0}
                        onClick={() => advanceSurvey(surveyAnswers)}
                      >
                        {step + 1 === STEPS.length ? "결과 보기" : "다음"}{" "}
                        <span aria-hidden="true">→</span>
                      </button>
                    )}
                  </>
                );
              })()
            )}

            {step > 0 && (
              <button type="button" className={styles.backLink} onClick={back}>
                ← 이전 질문
              </button>
            )}
          </div>
        )}

        {/* ── 리빌 (열구) ──────────────────────────────────────────────── */}
        {phase === "reveal" && (
          <div className={styles.reveal}>
            <p className={styles.revealHint}>
              {TEST_COPY.revealLead}
              <br />
              <strong>
                {TEST_COPY.revealAction} ({Math.min(taps, CRACKS_TO_BREAK)}/
                {CRACKS_TO_BREAK})
              </strong>
            </p>
            <button
              type="button"
              className={`${styles.blob} ${breaking ? styles.blobBreak : ""}`}
              data-shake={taps}
              style={{
                ["--taps" as string]: String(taps),
                ["--frac" as string]: String(taps / CRACKS_TO_BREAK),
                ["--pulse" as string]: String(pulse),
              }}
              onClick={tapBlob}
              aria-label="열덩이를 두드려 깨기"
            >
              {/* 끓는 열덩이 코어 */}
              <span className={styles.blobCore} aria-hidden="true" />

              {/* 균열(crack) — 탭이 늘수록 가지가 또렷해진다. taps 에 연동된 그룹
                  opacity 로 단계적으로 번지게. 라이브러리 없이 인라인 SVG. */}
              <svg
                className={styles.cracks}
                viewBox="0 0 100 100"
                aria-hidden="true"
                focusable="false"
              >
                <g
                  className={styles.crackLines}
                  fill="none"
                  stroke="rgba(40, 12, 4, 0.78)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* 중심에서 뻗는 5갈래 가지 + 잔가지. data-from 으로 등장 시점 지정.
                      pathLength=1 로 길이 정규화 → dashoffset 1→0 으로 자라남. */}
                  <path pathLength={1} data-from="2" strokeWidth="1.6" d="M50 50 L50 8" />
                  <path pathLength={1} data-from="2" strokeWidth="1.6" d="M50 50 L88 64" />
                  <path pathLength={1} data-from="3" strokeWidth="1.5" d="M50 50 L20 84" />
                  <path pathLength={1} data-from="4" strokeWidth="1.5" d="M50 50 L12 36" />
                  <path pathLength={1} data-from="5" strokeWidth="1.4" d="M50 50 L78 22" />
                  <path pathLength={1} data-from="6" strokeWidth="1.1" d="M50 24 L62 12" />
                  <path pathLength={1} data-from="6" strokeWidth="1.1" d="M68 58 L86 50" />
                  <path pathLength={1} data-from="7" strokeWidth="1.1" d="M34 68 L22 60" />
                  <path pathLength={1} data-from="7" strokeWidth="1.1" d="M30 42 L16 50" />
                  <path pathLength={1} data-from="8" strokeWidth="1" d="M64 38 L80 32" />
                  <path pathLength={1} data-from="8" strokeWidth="1" d="M44 78 L40 92" />
                  <path pathLength={1} data-from="9" strokeWidth="1" d="M58 64 L66 80" />
                </g>
              </svg>

              {/* 스파크/링 burst — pulse 가 바뀔 때마다 새 노드로 마운트되어
                  키프레임이 처음부터 재생(같은 자리 재탭도 매번 튄다). */}
              <span
                key={pulse}
                className={styles.burst}
                aria-hidden="true"
                data-active={pulse > 0 ? "1" : undefined}
              >
                <span className={styles.ring} />
                {SPARKS.map((s, i) => (
                  <span
                    key={i}
                    className={styles.spark}
                    style={{ ["--a" as string]: `${s}deg` }}
                  />
                ))}
              </span>
            </button>
          </div>
        )}

        {/* ── 결과 ──────────────────────────────────────────────────────
            상단: 2단(이미지+유형명 좌 / °C·한줄평·설명·궁합·공유/다시 우).
            하단: 세션 CTA 스트립 — 2단 아래 전체 폭에 걸치는 핵심 전환 밴드. */}
        {phase === "result" && result && (
          <div className={styles.result}>
            <div className={styles.resultMain}>
              <div className={styles.resultMedia}>
                <Image
                  src={`/animals/${result.id}.png`}
                  alt={`${result.name} (${result.emoji})`}
                  width={260}
                  height={260}
                  className={styles.animalImg}
                  priority
                />
                <p className={styles.resultLead}>{result.name}</p>
              </div>

              <div className={styles.resultText}>
                <p className={styles.temp}>
                  {result.tempLabel}
                  <span>°C</span>
                </p>
                <p className={styles.oneLiner}>“{result.oneLiner}”</p>
                <p className={styles.desc}>{result.desc}</p>

                {result.id === "swan" ? (
                  <p className={styles.matchSwan}>
                    <span className={styles.matchKey}>숨은 자아</span>
                    <span className={styles.matchWhy}>
                      모든 디자이너 안에 한 마리쯤 있는 모습
                    </span>
                  </p>
                ) : (
                  <dl className={styles.match}>
                    <div className={styles.matchRow}>
                      <dt className={styles.matchKey}>찰떡</dt>
                      <dd className={styles.matchVal}>
                        <span className={styles.matchAnimal}>
                          {result.good?.emoji} {result.good?.animal}
                        </span>
                        <span className={styles.matchWhy}>{result.good?.why}</span>
                      </dd>
                    </div>
                    <div className={styles.matchRow}>
                      <dt className={styles.matchKey}>상극</dt>
                      <dd className={styles.matchVal}>
                        <span className={styles.matchAnimal}>
                          {result.worst?.emoji} {result.worst?.animal}
                        </span>
                        <span className={styles.matchWhy}>{result.worst?.why}</span>
                      </dd>
                    </div>
                  </dl>
                )}

                {/* 공유(메인 CTA — 신청 마감으로 세션 신청 대신) + 다시 하기. */}
                <div className={styles.minorActions}>
                  <button
                    type="button"
                    className={styles.sharePrimary}
                    onClick={share}
                  >
                    {TEST_COPY.shareCta} <span aria-hidden="true">→</span>
                  </button>
                  <button
                    type="button"
                    className={styles.ghost}
                    onClick={restart}
                  >
                    {TEST_COPY.again}
                  </button>
                </div>
              </div>
            </div>

            {/* "부족한 1%" — 결핍 문구 + K-PRINT 전시 참관 유도(세미나 신청 마감). */}
            <div className={styles.gapBlock}>
              <p className={styles.gapTitle}>
                <span aria-hidden="true">🎟️</span> {TEST_COPY.gapTitle}
              </p>
              <p className={styles.gapText}>{result.gap}</p>
              <a
                className={styles.gapCta}
                href={siteContent.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                // 외부 이동이라 sendBeacon 우선(track 내부) — fire-and-forget.
                onClick={() => track("cta", { animalId: result.id, section: "K" })}
              >
                8.19–8.22 KINTEX · K-PRINT 2026 참관등록 바로가기{" "}
                <span aria-hidden="true">→</span>
              </a>
            </div>

            {toast && (
              <div className={styles.toast} role="status">
                {TEST_COPY.toast}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
