import { notFound } from "next/navigation";
import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Topbar from "@/components/Topbar/Topbar";
import Footer from "@/components/Footer/Footer";
import PostHero from "@/components/PostHero/PostHero";
import AuthorCard from "@/components/AuthorCard/AuthorCard";
import { mockPosts } from "@/data/mockPosts";
import { renderMarkdown } from "@/lib/highlight";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return mockPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = mockPosts.find((p) => p.slug === slug);

  if (!post) return { title: "Post não encontrado" };

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      images: post.image ? [{ url: post.image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = mockPosts.find((p) => p.slug === slug);

  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const contentPath = path.join(
    process.cwd(),
    "src/data/content",
    `${slug}.md`
  );

  const rawContent = fs.existsSync(contentPath)
    ? fs.readFileSync(contentPath, "utf-8")
    : null;

  const contentHtml = rawContent ? await renderMarkdown(rawContent) : null;

  return (
    <>
      <Topbar />

      {post.image && <PostHero image={post.image} title={post.title} />}

      <main className={styles.main}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>{post.title}</h1>
            <p className={styles.subtitle}>{post.summary}</p>

            {post.tags && post.tags.length > 0 && (
              <div className={styles.tags} aria-label="Tags do artigo">
                {post.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <time className={styles.date} dateTime={post.date}>
              {formattedDate}
            </time>
          </header>

          <div className={styles.divider} aria-hidden="true" />

          {contentHtml ? (
            <article
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          ) : (
            <p className={styles.noContent}>Conteúdo em breve.</p>
          )}

          <div className={styles.divider} aria-hidden="true" />

          <AuthorCard />

          <div className={styles.backWrapper}>
            <a href="/" className={styles.backLink}>
              &larr; Voltar para o blog
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
