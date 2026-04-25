import type { Post } from "@/types/post";

export const mockPosts: Post[] = [
  {
    slug: "escalando-apis-com-nextjs",
    title: "Escalando APIs com Next.js 16 e App Router",
    summary:
      "Explorando como construir APIs REST de alta performance utilizando os recursos mais recentes do App Router do Next.js, incluindo Server Actions e Route Handlers otimizados para produção.",
    date: "2026-04-20",
    tags: ["Next.js", "API", "Performance"],
  },
  {
    slug: "arquitetura-clean-em-typescript",
    title: "Arquitetura Clean em projetos TypeScript",
    summary:
      "Como aplicar os princípios da Clean Architecture em projetos TypeScript modernos, separando camadas de domínio, aplicação e infraestrutura com clareza e testabilidade.",
    date: "2026-04-10",
    tags: ["TypeScript", "Arquitetura", "Clean Code"],
  },
  {
    slug: "react-server-components-na-pratica",
    title: "React Server Components na prática",
    summary:
      "Um guia prático sobre quando e como utilizar React Server Components, suas vantagens em relação ao Client Components e os padrões emergentes para 2026.",
    date: "2026-03-28",
    tags: ["React", "RSC", "Next.js"],
  },
  {
    slug: "testes-de-integracao-com-vitest",
    title: "Testes de Integração com Vitest e MSW",
    summary:
      "Configurando um setup completo de testes de integração com Vitest e Mock Service Worker para garantir qualidade em aplicações React sem depender de implementações internas.",
    date: "2026-03-15",
    tags: ["Testes", "Vitest", "MSW"],
  },
  {
    slug: "devops-para-desenvolvedores-frontend",
    title: "DevOps para Desenvolvedores Frontend",
    summary:
      "Conceitos essenciais de DevOps que todo desenvolvedor frontend deveria conhecer: pipelines de CI/CD, feature flags, monitoramento e deploy contínuo com zero downtime.",
    date: "2026-03-01",
    tags: ["DevOps", "CI/CD", "Frontend"],
  },
];
