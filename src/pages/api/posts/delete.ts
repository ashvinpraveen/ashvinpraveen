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
    const { slug, uniqueId, siteSlug, postId } = body ?? {};

    if (!siteSlug) {
      return new Response(JSON.stringify({ error: 'Missing siteSlug' }), { status: 400 });
    }

    // Get the session token to pass to Convex
    const token = await auth.getToken();

    const client = new ConvexHttpClient(
      import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL
    );

    // Set the token for auth in Convex
    client.setAuth(token);

    // Use uniqueId if available, otherwise fall back to slug, or postId
    if (uniqueId) {
      await client.mutation(api.posts.deleteByUniqueId, { siteSlug, uniqueId });
    } else if (postId) {
      await client.mutation(api.posts.deleteByUniqueId, { siteSlug, uniqueId: postId });
    } else if (slug) {
      await client.mutation(api.posts.deleteBySlug, { slug, siteSlug });
    } else {
      return new Response(JSON.stringify({ error: 'Missing slug, uniqueId, or postId' }), { status: 400 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error('Error deleting post:', err);
    return new Response(
      JSON.stringify({ error: err?.message || 'Unexpected error' }),
      { status: 500 }
    );
  }
};

