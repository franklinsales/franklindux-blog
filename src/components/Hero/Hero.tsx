import Image from "next/image";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-label="Apresentação">
      <div className={styles.inner}>
        <div className={styles.avatarWrapper}>
          <Image
            src="/me.jpeg"
            alt="Foto de FranklinDux"
            width={80}
            height={80}
            className={styles.avatar}
            priority
          />
        </div>
      </div>
    </section>
  );
}
