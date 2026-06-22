import styles from "../admin.module.css";

export const metadata = { title: "관리자 로그인" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className={styles.loginWrap}>
      <form className={styles.loginForm} method="post" action="/api/admin/login">
        <h1 className={styles.loginTitle}>Design Summer · 관리</h1>
        <input
          className={styles.loginInput}
          type="password"
          name="password"
          placeholder="비밀번호"
          autoFocus
          required
        />
        <button className={styles.loginBtn} type="submit">
          로그인
        </button>
        {sp?.e ? (
          <p className={styles.loginErr}>비밀번호가 올바르지 않습니다.</p>
        ) : null}
      </form>
    </div>
  );
}
