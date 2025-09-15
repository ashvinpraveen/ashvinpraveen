import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const auth = ctx.locals.auth();
  if (!auth?.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await ctx.request.json();
    const { siteSlug, uniqueId, slug, title, content, description, published } = body ?? {};

    if (!siteSlug || !uniqueId || !slug || !title || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Get the session token to pass to Convex
    const token = await auth.getToken();

    const client = new ConvexHttpClient(
      import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL
    );

    // Set the token for auth in Convex
    client.setAuth(token);

    const postId = await client.mutation(api.posts.upsertByUniqueId, {
      siteSlug,
      uniqueId,
      slug,
      title,
      content,
      description,
      published: published ?? false
    });

    return new Response(JSON.stringify({ ok: true, postId }), { status: 200 });
  } catch (err: any) {
    console.error('Error upserting post:', err);
    return new Response(
      JSON.stringify({ error: err?.message || 'Unexpected error' }),
      { status: 500 }
    );
  }
};