import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const auth = ctx.locals.auth();
  if (!auth?.userId) return new Response('Unauthorized', { status: 401 });
  try {
    const { domain, slug } = await ctx.request.json();
    if (!slug || !domain) return new Response('Missing fields', { status: 400 });
    const token = await auth.getToken({ template: 'convex' });
    if (!token) return new Response('Unauthorized', { status: 401 });
    const client = new ConvexHttpClient(import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL);
    client.setAuth(token);
    const res = await client.mutation(api.sites.setCustomDomain, { slug, domain });
    const cnameTarget = import.meta.env.PUBLIC_NETLIFY_CNAME_TARGET || import.meta.env.NETLIFY_CNAME_TARGET || '';
    return new Response(JSON.stringify({ ok: true, ...res, cnameTarget }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'Failed to set domain' }), { status: 500 });
  }
};

