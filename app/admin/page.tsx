import Link from "next/link";
import styles from "./admin.module.css";
import { speakers } from "@/lib/content";
import { auraSpeakers } from "@/lib/auraContent";
import { readManifest } from "@/lib/serverImages";
import { WORK_SLOTS } from "@/lib/images";

export const dynamic = "force-dynamic";
export const metadata = { title: "이미지 관리 · Design Summer" };

type Slot = { key: string; label: string };

export default async function AdminPage() {
  const m = await readManifest();
  const auraList = auraSpeakers();

  const groups: { title: string; hint: string; items: Slot[] }[] = [
    {
      title: "브랜드",
      hint: "히어로 우상단 로고 (투명 PNG/SVG 권장 · 미업로드 시 K·print 텍스트)",
      items: [{ key: "kprint-logo", label: "K-print 로고" }],
    },
    {
      title: "키 비주얼",
      hint: "히어로 KV 소스",
      items: [{ key: "kv", label: "KV" }],
    },
    {
      title: "연사 프로필",
      hint: "세로 3:4 · 800×1067px 권장 · 흰/투명 배경",
      items: speakers.map((s) => ({
        key: `speaker-${s.id}`,
        label: `${s.studio} · ${s.name}`,
      })),
    },
    {
      title: "벽 로고",
      hint: "정사각/가로 · 투명 PNG 권장 (씬 벽 포스터)",
      items: speakers.map((s) => ({ key: `poster-${s.id}`, label: s.studio })),
    },
    {
      title: "대표작",
      hint: `가로 16:10 · ~1200px (씬 카드 캐러셀, 연사당 최대 ${WORK_SLOTS}장) · /aura 썸네일 클릭 시 크게 보기`,
      items: speakers.flatMap((s) =>
        Array.from({ length: WORK_SLOTS }, (_, i) => ({
          key: `work-${s.id}-${i + 1}`,
          label: `${s.studio} ${i + 1}`,
        })),
      ),
    },
    {
      title: "지난 행사 사진",
      hint: "가로 4:3 · ~1200px (개요 갤러리 · 큰 사진 1 + 작은 사진 2)",
      items: Array.from({ length: 3 }, (_, i) => ({
        key: `past-${i + 1}`,
        label: `지난 행사 ${i + 1}`,
      })),
    },
    {
      title: "참가 혜택 (benefit)",
      hint: "투명 PNG 권장 (컬러 배너 위에 떠 보이게) · 가로형 ~480×320px",
      items: [
        { key: "event-welcome", label: "welcome goods" },
        { key: "event-luckydraw", label: "lucky draw" },
        { key: "event-invitation", label: "K-PRINT invitation" },
      ],
    },
  ];

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h1 className={styles.title}>Design Summer · 이미지 관리</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className={styles.logout} href="/admin/stats">
            테스트 통계 →
          </Link>
          <form method="post" action="/api/admin/logout">
            <button className={styles.logout} type="submit">
              로그아웃
            </button>
          </form>
        </div>
      </header>
      <p className={styles.note}>
        텍스트(연사·세션·크레덴셜)는 <code>content/speakers.json</code> 을 직접
        수정합니다. 이 화면은 <strong>이미지만</strong> 관리합니다. 업로드 후
        같은 키의 기존 파일은 교체됩니다.
      </p>

      {groups.map((g) => (
        <section key={g.title} className={styles.group}>
          <div className={styles.groupHead}>
            <h2 className={styles.groupTitle}>{g.title}</h2>
            <span className={styles.groupHint}>{g.hint}</span>
          </div>
          <div className={styles.grid}>
            {g.items.map((it) => {
              const url = m[it.key];
              return (
                <div key={it.key} className={styles.slot}>
                  <div className={styles.preview}>
                    {url ? (
                      // 확장자 무관 런타임 라우트로 미리보기 — 업로드(어떤 확장자든)가
                      // 재빌드 없이 즉시 보인다. ?t=… 로 브라우저 캐시도 무력화.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/img/${it.key}?t=${Date.now()}`}
                        alt={it.label}
                      />
                    ) : (
                      <span className={styles.empty}>비어 있음</span>
                    )}
                  </div>
                  <p className={styles.slotLabel}>{it.label}</p>
                  <code className={styles.slotKey}>{it.key}</code>
                  <form
                    className={styles.uploadForm}
                    method="post"
                    action="/api/admin/upload"
                    encType="multipart/form-data"
                  >
                    <input type="hidden" name="key" value={it.key} />
                    <input
                      className={styles.file}
                      type="file"
                      name="file"
                      accept="image/*"
                      required
                    />
                    <button className={styles.upload} type="submit">
                      {url ? "교체" : "업로드"}
                    </button>
                  </form>
                  {url ? (
                    <form method="post" action="/api/admin/delete">
                      <input type="hidden" name="key" value={it.key} />
                      <button className={styles.del} type="submit">
                        삭제
                      </button>
                    </form>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className={styles.group}>
        <div className={styles.groupHead}>
          <h2 className={styles.groupTitle}>
            Aura 연사 내용 (이 페이지에서 직접 수정)
          </h2>
          <span className={styles.groupHint}>
            <code>/aura</code> 페이지에만 반영 · 저장 시{" "}
            <code>content/auraSpeakers.json</code>
          </span>
        </div>
        <div className={styles.textForms}>
          {auraList.map((s) => (
            <form
              key={s.id}
              className={styles.textForm}
              method="post"
              action="/api/admin/aura-text"
            >
              <input type="hidden" name="id" value={s.id} />
              <div className={styles.textFormHead}>
                <strong>
                  DAY {s.day} · {s.time}
                </strong>
                <code className={styles.slotKey}>{s.id}</code>
              </div>
              <label className={styles.field}>
                <span>스튜디오</span>
                <input
                  className={styles.text}
                  type="text"
                  name="studio"
                  defaultValue={s.studio}
                />
              </label>
              <label className={styles.field}>
                <span>이름</span>
                <input
                  className={styles.text}
                  type="text"
                  name="name"
                  defaultValue={s.name}
                />
              </label>
              <label className={styles.field}>
                <span>직함/역할</span>
                <input
                  className={styles.text}
                  type="text"
                  name="role"
                  defaultValue={s.role}
                />
              </label>
              <label className={styles.field}>
                <span>홈페이지 링크(URL)</span>
                <input
                  className={styles.text}
                  type="url"
                  name="url"
                  placeholder="https://…"
                  defaultValue={s.url ?? ""}
                />
              </label>
              <label className={styles.field}>
                <span>세션 제목</span>
                <input
                  className={styles.text}
                  type="text"
                  name="sessionTitle"
                  defaultValue={s.sessionTitle}
                />
              </label>
              <label className={styles.field}>
                <span>세션 설명</span>
                <textarea
                  className={styles.area}
                  name="sessionDesc"
                  rows={4}
                  defaultValue={s.sessionDesc}
                />
              </label>
              <label className={styles.field}>
                <span>크레덴셜 (한 줄에 하나)</span>
                <textarea
                  className={styles.area}
                  name="credentials"
                  rows={5}
                  defaultValue={s.credentials.join("\n")}
                />
              </label>
              <button className={styles.upload} type="submit">
                저장
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
