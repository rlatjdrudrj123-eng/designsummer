import styles from "./TerminalPage.module.css";

/* Blinking block cursor. Blink is pure CSS and disabled under
 * prefers-reduced-motion (handled in TerminalPage.module.css). */
export default function Cursor() {
  return <span className={styles.cursor} aria-hidden="true" />;
}
