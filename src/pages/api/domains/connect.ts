import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const auth = ctx.locals.auth();
  if (!auth?.userId) return new Response('Unauthorized', { status: 401 });
  try {
    const { domain, slug } = await ctx.request.json();
    if (!domain || !slug) return new Response('Missing fields', { status: 400 });

    const NETLIFY_TOKEN = import.meta.env.NETLIFY_AUTH_TOKEN;
    const NETLIFY_SITE_ID = import.meta.env.NETLIFY_SITE_ID;
    if (!NETLIFY_TOKEN || !NETLIFY_SITE_ID) {
      return new Response(JSON.stringify({ ok: false, error: 'Netlify env not configured' }), { status: 500 });
    }

    // Optional: ensure caller owns this site
    const token = await auth.getToken({ template: 'convex' });
    const client = new ConvexHttpClient(import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL);
    client.setAuth(token!);
    await client.query(api.sites.getSettings, { slug });

    // Attach domain to Netlify site
    const resp = await fetch(`https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/domains`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NETLIFY_TOKEN}`,
      },
      body: JSON.stringify({ hostname: domain })
    });
    const json = await resp.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok: resp.ok, status: resp.status, data: json }), { status: resp.ok ? 200 : resp.status });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'Failed to connect domain' }), { status: 500 });
  }
};

