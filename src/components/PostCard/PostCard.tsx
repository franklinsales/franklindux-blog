import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/types/post";
import styles from "./PostCard.module.css";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className={styles.card}>
      <Link
        href={`/posts/${post.slug}`}
        className={styles.link}
        aria-label={`Ler artigo: ${post.title}`}
      >
        {post.image && (
          <div className={styles.imageWrapper}>
            <Image
              src={post.image}
              alt={post.title}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 98vw, (max-width: 1200px) 90vw, 80vw"
            />
          </div>
        )}

        <div className={styles.content}>
          <div className={styles.meta}>
            <time className={styles.date} dateTime={post.date}>
              {formattedDate}
            </time>
            {post.tags && post.tags.length > 0 && (
              <div className={styles.tags} aria-label="Tags">
                {post.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <h2 className={styles.title}>{post.title}</h2>
          <p className={styles.summary}>{post.summary}</p>

          <span className={styles.readMore} aria-hidden="true">
            Ler mais &rarr;
          </span>
        </div>
      </Link>
    </article>
  );
}
