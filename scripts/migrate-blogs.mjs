import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

async function main() {
  const root = new URL('..', import.meta.url).pathname;
  const blogDir = path.join(root, 'src/content/blog');
  const siteSlug = process.env.DEFAULT_SITE_SLUG;
  const convexUrl = process.env.CONVEX_URL || process.env.PUBLIC_CONVEX_URL;
  if (!siteSlug) throw new Error('DEFAULT_SITE_SLUG is not set');
  if (!convexUrl) throw new Error('CONVEX_URL or PUBLIC_CONVEX_URL is not set');
  const client = new ConvexHttpClient(convexUrl);
  const entries = await fs.readdir(blogDir);
  for (const file of entries) {
    if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
    const full = path.join(blogDir, file);
    const src = await fs.readFile(full, 'utf8');
    const { data, content } = matter(src);
    const slug = file.replace(/\.(md|mdx)$/i, '');
    const title = data.title || slug;
    const description = data.description || '';
    const published = true;
    const createdAt = data.pubDate ? new Date(data.pubDate).getTime() : undefined;
    const publishedAt = createdAt;
    console.log(`Migrating ${slug} ...`);
    await client.mutation(api.posts.upsertBySlug, {
      siteSlug,
      slug,
      title,
      content,
      description,
      published,
      publishedAt,
      createdAt,
    });
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

