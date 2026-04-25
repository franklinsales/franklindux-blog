## O que é Clean Architecture?

A **Clean Architecture**, popularizada por Robert C. Martin (Uncle Bob), organiza o código em camadas concêntricas onde as dependências sempre apontam para dentro — em direção ao domínio. Em TypeScript, essa separação fica ainda mais natural com interfaces e tipos.

## As Camadas

A estrutura de pastas reflete as camadas:

```bash
src/
  domain/          # Entidades + interfaces de repositório
  application/     # Casos de uso
  infrastructure/  # Implementações concretas (DB, APIs)
  presentation/    # Controllers, componentes React
```

## Definindo o Domínio

A camada de domínio não conhece nada externo. Apenas entidades e contratos:

```typescript
// domain/entities/Post.ts
export interface Post {
  id: string
  title: string
  slug: string
  content: string
  publishedAt: Date
}

// domain/repositories/PostRepository.ts
export interface PostRepository {
  findBySlug(slug: string): Promise<Post | null>
  findAll(options?: { page: number; limit: number }): Promise<Post[]>
  save(post: Post): Promise<Post>
}
```

## Casos de Uso

A camada de aplicação orquestra o domínio sem saber como os dados são armazenados:

```typescript
// application/use-cases/GetPostBySlug.ts
import type { PostRepository } from '@/domain/repositories/PostRepository'

export class GetPostBySlug {
  constructor(private readonly repository: PostRepository) {}

  async execute(slug: string) {
    const post = await this.repository.findBySlug(slug)

    if (!post) {
      throw new Error(`Post não encontrado: ${slug}`)
    }

    return post
  }
}
```

## Infraestrutura

A implementação concreta do repositório fica na camada de infraestrutura:

```typescript
// infrastructure/repositories/PrismaPostRepository.ts
import type { PrismaClient } from '@prisma/client'
import type { PostRepository } from '@/domain/repositories/PostRepository'
import type { Post } from '@/domain/entities/Post'

export class PrismaPostRepository implements PostRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findBySlug(slug: string): Promise<Post | null> {
    return this.prisma.post.findUnique({ where: { slug } })
  }

  async findAll({ page = 1, limit = 10 } = {}) {
    return this.prisma.post.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { publishedAt: 'desc' },
    })
  }

  async save(post: Post): Promise<Post> {
    return this.prisma.post.upsert({
      where: { id: post.id },
      create: post,
      update: post,
    })
  }
}
```

## Testabilidade

O maior benefício é a testabilidade. O caso de uso pode ser testado com um repositório mock sem nenhuma dependência de banco:

```typescript
// application/use-cases/GetPostBySlug.test.ts
import { GetPostBySlug } from './GetPostBySlug'
import type { PostRepository } from '@/domain/repositories/PostRepository'

const mockRepository: PostRepository = {
  findBySlug: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
}

test('lança erro se o post não existir', async () => {
  vi.mocked(mockRepository.findBySlug).mockResolvedValue(null)
  const useCase = new GetPostBySlug(mockRepository)

  await expect(useCase.execute('slug-inexistente')).rejects.toThrow(
    'Post não encontrado'
  )
})
```

## Conclusão

Clean Architecture em TypeScript não precisa ser burocrática. Com interfaces bem definidas e injeção de dependência simples, você ganha testabilidade, flexibilidade para trocar implementações e um código que comunica a intenção do negócio com clareza.
