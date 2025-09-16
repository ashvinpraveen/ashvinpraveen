import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const auth = ctx.locals.auth();
  if (!auth?.userId) return new Response('Unauthorized', { status: 401 });
  try {
    const { newSlug } = await ctx.request.json();
    if (!newSlug) return new Response('Missing fields', { status: 400 });
    const token = await auth.getToken({ template: 'convex' });
    if (!token) return new Response('Unauthorized', { status: 401 });
    const client = new ConvexHttpClient(import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL);
    client.setAuth(token);
    // Resolve the caller's current site from ownership to avoid mismatch
    const sites = await client.query(api.sites.listSitesForClerk, { clerkUserId: auth.userId });
    const site = Array.isArray(sites) && sites[0] || null;
    if (!site) return new Response(JSON.stringify({ ok: false, error: 'No site found for user' }), { status: 400 });
    const res = await client.mutation(api.sites.changeSlug, { currentSlug: site.slug, newSlug });
    return new Response(JSON.stringify(res), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'Failed to change slug' }), { status: 500 });
  }
};
