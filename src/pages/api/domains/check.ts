import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import dns from 'node:dns';
const resolver = new (dns.promises.Resolver)();

export const prerender = false;

async function safeResolveTXT(host: string) {
  try { return await resolver.resolveTxt(host); } catch { return []; }
}
async function safeResolveCNAME(host: string) {
  try { return await resolver.resolveCname(host); } catch { return []; }
}
async function safeResolveA(host: string) {
  try { return await resolver.resolve4(host); } catch { return []; }
}

export const GET: APIRoute = async ({ url }) => {
  const domain = (url.searchParams.get('domain') || '').trim().toLowerCase();
  const slug = (url.searchParams.get('slug') || '').trim();
  if (!domain || !slug) return new Response(JSON.stringify({ ok: false, error: 'Missing domain or slug' }), { status: 400 });

  const client = new ConvexHttpClient(import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL);
  const settings = await client.query(api.sites.getSettings, { slug });
  const token = (settings as any)?.domainVerificationToken || (settings as any)?.token;
  const cnameTarget = (import.meta as any).env.PUBLIC_NETLIFY_CNAME_TARGET || (import.meta as any).env.NETLIFY_CNAME_TARGET || '';

  const txtHost = `_ap-site-verification.${domain}`;
  const txt = await safeResolveTXT(txtHost);
  const flatTxt = txt.flat().map((s) => s.toString());
  const hasTxt = token ? flatTxt.includes(token) : false;

  const cnames = await safeResolveCNAME(`www.${domain}`);
  const hasCname = cnameTarget ? cnames.some((c) => c.replace(/\.$/, '') === cnameTarget.replace(/\.$/, '')) : cnames.length > 0;
  const apexA = await safeResolveA(domain);

  const ok = !!(hasTxt && (hasCname || apexA.length > 0));
  return new Response(JSON.stringify({ ok, hasTxt, hasCname, cnames, apexA, expectedCname: cnameTarget, token }), { status: 200 });
};

