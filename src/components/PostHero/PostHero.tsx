import Image from "next/image";
import styles from "./PostHero.module.css";

interface PostHeroProps {
  image: string;
  title: string;
}

export default function PostHero({ image, title }: PostHeroProps) {
  return (
    <section className={styles.hero} aria-label="Imagem de capa do artigo">
      <div className={styles.imageWrapper}>
        <Image
          src={image}
          alt={`Imagem de capa: ${title}`}
          fill
          className={styles.image}
          priority
          sizes="100vw"
        />
        <div className={styles.overlay} aria-hidden="true" />
      </div>
    </section>
  );
}
