import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const slug = (url.searchParams.get('slug') || '').trim();
  if (!slug) return new Response(JSON.stringify({ available: false, reason: 'Missing slug' }), { status: 400 });
  try {
    const client = new ConvexHttpClient(import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL);
    const res = await client.query(api.sites.checkSlugAvailability, { slug });
    return new Response(JSON.stringify(res), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ available: false, reason: e?.message || 'Check failed' }), { status: 500 });
  }
};

