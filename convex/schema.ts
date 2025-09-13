import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// Basic multi-tenant schema: users own sites; sites have posts
export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    username: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_clerk_id', ['clerkUserId']).index('by_username', ['username']),

  sites: defineTable({
    ownerId: v.id('users'),
    name: v.string(),
    slug: v.string(), // e.g. username or custom slug
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_slug', ['slug']).index('by_owner', ['ownerId']),

  posts: defineTable({
    siteId: v.id('sites'),
    title: v.string(),
    slug: v.string(),
    content: v.string(), // markdown
    description: v.optional(v.string()),
    published: v.boolean(),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_site_slug', ['siteId', 'slug']).index('by_site', ['siteId']),
  
  pages: defineTable({
    siteId: v.id('sites'),
    key: v.string(), // e.g., 'about', 'home'
    title: v.string(),
    content: v.string(), // markdown
    updatedAt: v.number(),
  }).index('by_site_key', ['siteId', 'key']).index('by_site', ['siteId']),
});
