import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const auth = ctx.locals.auth();
  if (!auth?.userId) return new Response('Unauthorized', { status: 401 });
  const form = await ctx.request.formData();
  const key = String(form.get('key') || '');
  const title = String(form.get('title') || '');
  const content = String(form.get('content') || '');
  if (!key || !title) return new Response('Bad request', { status: 400 });
  const token = await auth.getToken();
  const client = new ConvexHttpClient(import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL);
  client.setAuth(token);
  const sites = await client.query(api.sites.listSitesForClerk, { clerkUserId: auth.userId });
  const site = Array.isArray(sites) && sites[0] || null;
  if (!site) return new Response('No site', { status: 400 });
  await client.mutation(api.pages.upsert, { siteSlug: site.slug, key, title, content });
  return new Response(null, { status: 303, headers: { Location: '/app/pages' } });
};

