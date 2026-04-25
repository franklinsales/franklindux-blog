## O que são React Server Components?

**React Server Components (RSC)** permitem que componentes sejam renderizados exclusivamente no servidor, sem enviar JavaScript para o cliente. No Next.js 16, todos os componentes dentro de `app/` são Server Components por padrão.

## Server vs Client: Quando usar cada um

A regra é simples: comece com Server Components e mova para Client (`'use client'`) apenas quando precisar de interatividade:

```typescript
// Server Component (padrão) — acessa DB, filesystem, APIs privadas
async function PostList() {
  const posts = await db.post.findMany()
  return <ul>{posts.map(p => <PostItem key={p.id} post={p} />)}</ul>
}

// Client Component — hooks, eventos, estado local
'use client'
function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false)
  return (
    <button onClick={() => setLiked(l => !l)}>
      {liked ? '❤️' : '🤍'}
    </button>
  )
}
```

## Padrão: Composição de Server + Client

O padrão mais importante é **passar Server Components como `children` para Client Components**. Isso mantém os filhos no servidor:

```tsx
// app/posts/[slug]/page.tsx — Server Component
import { LikeButton } from '@/components/LikeButton'

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      {/* LikeButton é Client, mas o resto permanece no servidor */}
      <LikeButton postId={post.id} />
    </article>
  )
}
```

## Server Actions

RSC se integram nativamente com **Server Actions** para mutações seguras:

```typescript
// app/actions/likePost.ts
'use server'
import { revalidatePath } from 'next/cache'

export async function likePost(postId: string) {
  await db.like.create({ data: { postId } })
  revalidatePath(`/posts/${postId}`)
}
```

```tsx
// Uso no componente
import { likePost } from '@/app/actions/likePost'

function LikeForm({ postId }: { postId: string }) {
  return (
    <form action={likePost.bind(null, postId)}>
      <button type="submit">Curtir</button>
    </form>
  )
}
```

## Conclusão

RSC em 2026 é a forma padrão de construir aplicações Next.js. A chave é entender o modelo mental: server por padrão, client apenas para interatividade. Com isso, você reduz o JavaScript enviado ao cliente e mantém dados sensíveis no servidor.
