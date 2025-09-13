import type { APIRoute } from 'astro';

export const prerender = false;

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

export const GET: APIRoute = async (ctx) => {
  const slug = ctx.params.slug as string;
  if (!slug) return new Response('Not found', { status: 404 });

  const client = new ConvexHttpClient(
    import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL
  );
  const site = await client.query(api.sites.getSiteBySlug, { slug });
  const posts = await client.query(api.posts.listBySite, { siteSlug: slug });
  return new Response(JSON.stringify({ site, posts }), { status: 200 });
};
