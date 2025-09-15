import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const auth = ctx.locals.auth();
  if (!auth?.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await ctx.request.json();
    const { siteSlug, title, bio } = body ?? {};

    if (!siteSlug) {
      return new Response(JSON.stringify({ error: 'Missing siteSlug' }), { status: 400 });
    }

    const token = await auth.getToken({ template: 'convex' });
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const client = new ConvexHttpClient(
      import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL
    );
    client.setAuth(token);

    await client.mutation(api.profiles.updateProfile, {
      siteSlug,
      title: title || undefined,
      bio: bio || undefined
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Unexpected error' }),
      { status: 500 }
    );
  }
};
