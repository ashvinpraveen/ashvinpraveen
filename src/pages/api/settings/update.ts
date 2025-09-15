import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const auth = ctx.locals.auth();
  if (!auth?.userId) return new Response('Unauthorized', { status: 401 });

  try {
    const form = await ctx.request.formData();
    const slug = String(form.get('slug') || '');
    if (!slug) return new Response('Missing slug', { status: 400 });

    let effectiveSlug = slug;
    const clientList = new ConvexHttpClient(import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL);
    const token2 = await auth.getToken({ template: 'convex' });
    if (token2) clientList.setAuth(token2);
    try {
      const sites = await clientList.query(api.sites.listSitesForClerk, { clerkUserId: auth.userId });
      const site = Array.isArray(sites) && sites[0] || null;
      if (site) effectiveSlug = site.slug;
    } catch {}

    const payload: any = { slug: effectiveSlug };
    const fields = [
      'name','title','bio','seoTitle','seoDescription','themeMode','primaryColor','backgroundColor','fontBody','fontHeading','customDomain'
    ];
    for (const f of fields) {
      const v = form.get(f);
      if (v !== null) payload[f] = String(v);
    }
    // Image ids may be provided as strings
    const ogImageId = form.get('ogImageId');
    const backgroundImageId = form.get('backgroundImageId');
    if (ogImageId) payload.ogImageId = ogImageId as any;
    if (backgroundImageId) payload.backgroundImageId = backgroundImageId as any;

    const token = await auth.getToken({ template: 'convex' });
    const client = new ConvexHttpClient(import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL);
    if (token) client.setAuth(token);

    // Ensure the user exists and has a site with this slug
    await client.mutation(api.sites.upsertUser, { clerkUserId: auth.userId, username: slug });
    await client.mutation(api.sites.updateSettings, payload);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'Failed to update settings' }), { status: 500 });
  }
};
