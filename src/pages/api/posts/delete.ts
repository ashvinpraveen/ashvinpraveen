import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const auth = ctx.locals.auth();
  if (!auth?.userId) return new Response('Unauthorized', { status: 401 });
  const form = await ctx.request.formData();
  const slug = String(form.get('slug') || '');
  if (!slug) return new Response('Bad request', { status: 400 });
  const client = new ConvexHttpClient(import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL);
  // Minimal delete mutation; implement in Convex
  try {
    await client.mutation(api.posts.deleteBySlug, { slug });
    return new Response(null, { status: 303, headers: { Location: '/app/posts' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Failed' }), { status: 500 });
  }
};

