## Introdução

O **App Router** do Next.js 16 redefiniu a forma como construímos APIs. Com os **Route Handlers**, temos controle granular de cache, suporte nativo a streaming e integração com o Edge Runtime — tudo isso com tipagem forte em TypeScript desde a primeira linha.

Neste artigo, exploramos as principais estratégias para escalar APIs robustas sem comprometer a experiência do desenvolvedor.

## Route Handlers: A evolução das API Routes

Os Route Handlers substituem as antigas `pages/api` e oferecem muito mais poder. Um handler básico já inclui validação de entrada com Zod:

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams))

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const posts = await fetchPosts(parsed.data)

  return NextResponse.json(posts, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
    },
  })
}
```

## Caching com `unstable_cache`

Uma das features mais poderosas é o cache integrado. Para lógica de banco de dados, `unstable_cache` (estável no Next.js 16) é o caminho:

```typescript
import { unstable_cache as cache } from 'next/cache'

export const getPostBySlug = cache(
  async (slug: string) => {
    return await db.post.findUnique({ where: { slug } })
  },
  ['post-by-slug'],
  { revalidate: 3600, tags: ['posts'] }
)
```

Ao chamar `revalidateTag('posts')` — por exemplo, em um webhook do CMS — todos os dados com essa tag são invalidados automaticamente. Sem nenhum deploy.

## Streaming com ReadableStream

Para endpoints que retornam grandes volumes de dados, o streaming evita timeouts e melhora o Time to First Byte (TTFB):

```typescript
// app/api/export/route.ts
export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const cursor = db.post.streamAll()

      for await (const post of cursor) {
        controller.enqueue(
          encoder.encode(JSON.stringify(post) + '\n')
        )
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' },
  })
}
```

## Middleware para Autenticação

O `middleware.ts` roda no Edge Runtime antes de qualquer Route Handler, ideal para autenticação com latência mínima:

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value

  if (!token || !verifyToken(token)) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/admin/:path*'],
}
```

## Conclusão

Escalar APIs com Next.js 16 é, antes de tudo, questão de aproveitar bem os primitivos nativos: Route Handlers com validação Zod, cache declarativo por tags e streaming onde faz sentido. O resultado é uma API que cresce com o produto sem sacrificar a DX.
