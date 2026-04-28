import type { Post } from "@/types/post";

export const mockPosts: Post[] = [
  {
    slug: "hello-world",
    title: "<<< Hello World",
    summary:
      "Iniciando a minha jornada em documentar as minhas experiências e aprendizados no desenvolvimento de software.",
    date: "2026-04-20",
    tags: ["FKDUX"],
    image: "/posts/hello-world.png",
  },
  {
    slug: "llms-01-introducacao-parte-1-da-serie-de-llms",
    title: "LLMs: Introdução - Parte 1 da Série de LLMs",
    summary:
      "Essa é a primeira parte da série de posts sobre LLMs (Modelos de Linguagem de Grande Escala). Nesse post inicial, vamos explorar: o que são LLMs, como eles funcionam e por que estão revolucionando a inteligência artificial.",
    date: "2026-04-28",
    tags: ["LLMs", "Inteligência Artificial"],
    image: "/posts/01-llms.png",
  }
];
