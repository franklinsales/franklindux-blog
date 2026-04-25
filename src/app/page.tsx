import type { Metadata } from "next";
import Topbar from "@/components/Topbar/Topbar";
import Hero from "@/components/Hero/Hero";
import PostCard from "@/components/PostCard/PostCard";
import Footer from "@/components/Footer/Footer";
import { mockPosts } from "@/data/mockPosts";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Artigos sobre desenvolvimento de software, arquitetura, boas práticas e tecnologia.",
};

export default function Home() {
  return (
    <>
      <Topbar />
      <Hero />
      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.posts} aria-label="Artigos recentes">
            {mockPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
