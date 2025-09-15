import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('slug');
  if (!slug) return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
  try {
    const client = new ConvexHttpClient(import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL);
    const data = await client.query(api.profiles.getProfile, { siteSlug: slug });
    return new Response(JSON.stringify({ ok: true, ...data, socialLinks: data?.socialLinks || [] }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'Failed to load profile' }), { status: 500 });
  }
};
