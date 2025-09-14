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
  const published = String(form.get('published') || '') === 'true' ? true : undefined;
  const toggleTo = published === undefined ? undefined : published;
  const token = await auth.getToken();
  const client = new ConvexHttpClient(import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL);
  client.setAuth(token);
  try {
    // Look up default site slug via sites.listSitesForClerk
    const sites = await client.query(api.sites.listSitesForClerk, { clerkUserId: auth.userId });
    const site = Array.isArray(sites) && sites[0] || null;
    if (!site) throw new Error('No site');
    await client.mutation(api.posts.publishToggle, { siteSlug: site.slug, slug, published: toggleTo ?? true });
    return new Response(null, { status: 303, headers: { Location: '/app/posts' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Failed' }), { status: 500 });
  }
};

