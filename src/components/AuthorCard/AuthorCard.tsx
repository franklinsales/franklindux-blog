import Image from "next/image";
import styles from "./AuthorCard.module.css";

export default function AuthorCard() {
  return (
    <aside className={styles.card} aria-label="Sobre o autor">
      <div className={styles.inner}>
        <div className={styles.avatarWrapper}>
          <Image
            src="/me.jpeg"
            alt="Foto de FranklinDux"
            width={60}
            height={60}
            className={styles.avatar}
          />
        </div>
        <div className={styles.info}>
          <p className={styles.label}>Escrito por</p>
          <p className={styles.name}>FranklinDux</p>
          <p className={styles.bio}>
            Desenvolvedor de software apaixonado por arquitetura, boas práticas
            e tecnologias modernas.
          </p>
          <a
            href="https://linkedin.com/in/franklindux"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            aria-label="Perfil LinkedIn de FranklinDux (abre em nova aba)"
          >
            LinkedIn &rarr;
          </a>
        </div>
      </div>
    </aside>
  );
}
