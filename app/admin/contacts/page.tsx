import Link from "next/link";
import styles from "../admin.module.css";
import { getDb } from "@/lib/firebaseAdmin";
import { ANIMALS, SWAN, type AnimalId } from "@/lib/animalTest";

/* /admin/contacts — 커피 쿠폰 응모자 명단(개인정보).
   미들웨어(/admin/:path*)가 인증을 강제한다. contacts 컬렉션 최신순. */

export const dynamic = "force-dynamic";
export const metadata = { title: "쿠폰 응모자 · Design Summer" };

type Row = {
  id: string;
  name: string;
  phone: string;
  animalId: string | null;
  at: string;
};

function animalName(id: string | null): string {
  if (!id) return "-";
  if (id === "swan") return `${SWAN.emoji} ${SWAN.name}`;
  const a = ANIMALS[id as Exclude<AnimalId, "swan">];
  return a ? `${a.emoji} ${a.name}` : id;
}

async function load(): Promise<{ rows: Row[]; available: boolean }> {
  const db = getDb();
  if (!db) return { rows: [], available: false };
  try {
    const snap = await db
      .collection("contacts")
      .orderBy("t", "desc")
      .limit(1000)
      .get();
    const rows: Row[] = snap.docs.map((d) => {
      const v = d.data() as {
        name?: string;
        phone?: string;
        animalId?: string | null;
        t?: { toDate?: () => Date };
      };
      let at = "-";
      try {
        const dt = v.t?.toDate?.();
        if (dt) {
          at = new Intl.DateTimeFormat("ko-KR", {
            dateStyle: "short",
            timeStyle: "short",
            timeZone: "Asia/Seoul",
          }).format(dt);
        }
      } catch {
        /* ignore */
      }
      return {
        id: d.id,
        name: v.name ?? "",
        phone: v.phone ?? "",
        animalId: v.animalId ?? null,
        at,
      };
    });
    return { rows, available: true };
  } catch {
    return { rows: [], available: false };
  }
}

export default async function ContactsPage() {
  const { rows, available } = await load();

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h1 className={styles.title}>Design Summer · 쿠폰 응모자</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className={styles.logout} href="/admin/stats">
            ← 테스트 통계
          </Link>
        </div>
      </header>

      {!available ? (
        <p className={styles.note}>
          Firestore 에 연결할 수 없어 명단을 불러오지 못했습니다.
        </p>
      ) : (
        <p className={styles.note}>
          커피 쿠폰 응모자 {rows.length.toLocaleString()}명 (개인정보처리방침 동의자만
          · 최신순 최대 1,000건). <strong>외부 공유 금지</strong>
        </p>
      )}

      <section className={styles.group}>
        <div className={styles.groupHead}>
          <h2 className={styles.groupTitle}>응모자 명단</h2>
          <span className={styles.groupHint}>이름 · 휴대폰 · 결과 유형 · 응모 시각</span>
        </div>

        {rows.length === 0 ? (
          <p className={styles.note}>아직 응모자가 없습니다.</p>
        ) : (
          <div className={styles.qList}>
            {rows.map((r, i) => (
              <div
                key={r.id}
                className={styles.barRow}
                style={{ gap: 14, alignItems: "baseline" }}
              >
                <span className={styles.barNum} style={{ width: 44 }}>
                  {i + 1}
                </span>
                <span
                  className={styles.barName}
                  style={{ width: 120, fontWeight: 700 }}
                >
                  {r.name}
                </span>
                <span className={styles.barName} style={{ width: 150 }}>
                  {r.phone}
                </span>
                <span className={styles.barName} style={{ flex: 1 }}>
                  {animalName(r.animalId)}
                </span>
                <span className={styles.barNum} style={{ width: 130 }}>
                  {r.at}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
