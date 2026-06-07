import type { Post } from "@/types/post";

export const mockPosts: Post[] = [
  {
    slug: "03-aws-iam-overview-visao-geral` ",
    title: "O que é IAM  e por que ele existe? — Série sobre AWS - Parte 3",
    summary:
      "Se existe um único serviço que você precisa entender profundamente antes de qualquer outro na AWS, esse é o IAM. Não o EC2, não o RDS, não o S3 e nem o Elastic Beanstalk. Comece pelo IAM.",
    date: "2026-05-07 03:50:53",
    tags: ["Cloud", "AWS", "Infraestrutura"],
    image: "/posts/aws-iam-main-imagem-franklindux.png",
  },
  {
    slug: "02-linguagem-basica-termos-aws",
    title: "Linguagem Básica da AWS — Série sobre AWS - Parte 2",
    summary:
      "Na segunda parte desta série, exploramos a linguagem básica da AWS, incluindo recursos, ARNs, tags, e outros conceitos fundamentais que aparecem em todos os serviços e documentações da AWS.",
    date: "2026-05-23 16:39:53",
    tags: ["Cloud", "AWS", "Infraestrutura"],
    image: "/posts/Resource-ARN-Tags.png",
  },
  {
    slug: "01-o-que-e-cloud-e-aws",
    title: "O que é Cloud e AWS? — Série sobre AWS - Parte 1",
    summary:
      "Na primeira parte desta série, exploramos o que é cloud computing e como a AWS se tornou líder nesse mercado. Abordamos os conceitos básicos de IaaS, PaaS e SaaS, além de discutir a importância de regiões e Availability Zones, o uso do Root User e como criar uma conta AWS.",
    date: "2026-05-17 21:51:45",
    tags: ["Cloud", "AWS", "Infraestrutura"],
    image: "/posts/aws-intro-part-one.png",
  },
  {
    slug: "llms-02-transformer-self-attention-token-embedding-neural-franklindux",
    title: "LLMs: O que é um Transformer? — Parte 2",
    summary:
      "Na primeira parte desta série, exploramos o que são LLMs e como eles funcionam internamente. Agora, é hora de avançar para a arquitetura que tornou esses modelos possíveis: o Transformer. Responsável por revolucionar o processamento de linguagem natural, o Transformer é a base dos LLMs modernos. Sua estrutura inovadora permite que modelos compreendam contexto, identifiquem relações entre palavras e gerem texto de forma fluida e coerente.Nesta segunda parte, vamos dissecar essa arquitetura, explorando seus principais componentes e entendendo como eles trabalham em conjunto para processar, interpretar e gerar linguagem.",
    date: "2026-05-04 07:51:45",
    tags: ["LLMs", "Inteligência Artificial", "Transformer"],
    image: "/posts/transformer-llm-franklindux.png",
  },
  {
    slug: "llms-01-introducacao-parte-1-da-serie-de-maquina-inteligencia-artificial",
    title: "LLMs: Como uma máquina aprendeu a falar — Parte 1",
    summary:
      "Nos últimos anos, termos como ChatGPT, Claude e Gemini passaram a fazer parte do vocabulário cotidiano, mas o que há por trás dessas ferramentas? Esta é a primeira parte de uma série de posts sobre LLMs (Large Language Models, ou Modelos de Linguagem de Grande Escala). Neste primeiro post, o ponto de partida: o que são LLMs, de onde vieram e como funcionam por dentro.",
    date: "2026-05-02 06:32:14",
    tags: ["LLMs", "Inteligência Artificial"],
    image: "/posts/01-llms.png",
  },
  {
    slug: "hello-world",
    title: "<<< Hello World",
    summary:
      "Iniciando a minha jornada em documentar as minhas experiências e aprendizados no desenvolvimento de software.",
    date: "2026-04-20 08:02:23",
    tags: ["FKDUX"],
    image: "/posts/hello-world.png",
  }
];
