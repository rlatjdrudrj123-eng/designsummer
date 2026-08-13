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
          {rows.length > 0 && (
            <a
              className={styles.logout}
              href="/api/admin/contacts-csv"
              style={{
                background: "#1a1310",
                color: "#fff",
                borderColor: "#1a1310",
              }}
            >
              CSV 내려받기 ↓
            </a>
          )}
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
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thNum} scope="col">
                    #
                  </th>
                  <th scope="col">이름</th>
                  <th scope="col">휴대폰</th>
                  <th scope="col">결과 유형</th>
                  <th scope="col">응모 시각</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id}>
                    <td className={styles.thNum}>{i + 1}</td>
                    <td className={styles.tdName}>{r.name}</td>
                    <td className={styles.tdPhone}>{r.phone}</td>
                    <td>{animalName(r.animalId)}</td>
                    <td className={styles.tdTime}>{r.at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
