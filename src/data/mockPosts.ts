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
    slug: "llms-01-introducacao-parte-1-da-serie-de-maquina-inteligencia-artificial",
    title: "LLMs: Como uma máquina aprendeu a falar — Parte 1",
    summary:
      "Nos últimos anos, termos como ChatGPT, Claude e Gemini passaram a fazer parte do vocabulário cotidiano, mas o que há por trás dessas ferramentas? Esta é a primeira parte de uma série de posts sobre LLMs (Large Language Models, ou Modelos de Linguagem de Grande Escala), tecnologia que está no centro dessa transformação. Ao longo desta série, vamos construir uma compreensão progressiva e fundamentada do tema. Neste primeiro post, o ponto de partida: o que são LLMs, de onde vieram e como funcionam por dentro.",
    date: "2026-05-02",
    tags: ["LLMs", "Inteligência Artificial"],
    image: "/posts/01-llms.png",
  },
  {
    slug: "part2-llm-transformer",
    title: "LLMs: O que é um Transformer? — Parte 2",
    summary:
      "Na primeira parte desta série, vimos o que são LLMs e como eles funcionam por dentro. Agora, vamos dar um passo adiante e entender a arquitetura que tornou tudo isso possível: o Transformer. O Transformer é a espinha dorsal dos LLMs modernos, e sua estrutura inovadora é o que permite que essas máquinas aprendam a falar de maneira tão fluida e natural. Nesta segunda parte, vamos dissecar o Transformer, explicando seus componentes principais e como eles trabalham juntos para processar e gerar linguagem.",
    date: "2026-05-16",
    tags: ["LLMs", "Inteligência Artificial", "Transformer"],
  }
];
