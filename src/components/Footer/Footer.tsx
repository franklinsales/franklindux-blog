import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.text}>
          &copy; {currentYear}{" "}
          <span className={styles.brand}>FranklinDux</span> &mdash; Todos os
          direitos reservados.
        </p>
        <p className={styles.sub}>
          Feito com Next.js &amp; muito caf&eacute;.
        </p>
      </div>
    </footer>
  );
}
