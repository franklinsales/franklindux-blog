import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import styles from "./Topbar.module.css";

export default function Topbar() {
  return (
    <section className={styles.topbar} aria-label="Barra de navegação">
      <div className={styles.inner}>
        <Link
          href="/"
          className={styles.logo}
          aria-label="FranklinDux — Página inicial"
        >
          FranklinDux
        </Link>

        <nav className={styles.nav} aria-label="Menu principal">
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <a
            href="https://linkedin.com/in/franklindux"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navLink}
            aria-label="Perfil LinkedIn de FranklinDux (abre em nova aba)"
          >
            LinkedIn
          </a>
          <span className={styles.navDivider} aria-hidden="true" />
          <ThemeToggle />
        </nav>
      </div>
    </section>
  );
}
