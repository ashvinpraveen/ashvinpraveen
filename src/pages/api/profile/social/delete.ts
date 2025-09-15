import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const auth = ctx.locals.auth();
  if (!auth?.userId) return new Response('Unauthorized', { status: 401 });
  try {
    const body = await ctx.request.json();
    const { linkId } = body || {};
    const token = await auth.getToken();
    const client = new ConvexHttpClient(import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL);
    client.setAuth(token);
    await client.mutation(api.profiles.deleteSocialLink, { linkId });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'Failed to delete social link' }), { status: 500 });
  }
};
