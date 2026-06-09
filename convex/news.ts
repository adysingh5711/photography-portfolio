import { query, mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { requireAuth, resolveImageUrl } from "./lib";

async function coverUrlFor(ctx: QueryCtx, post: Doc<"news">) {
  if (!post.coverImageId) return null;
  return resolveImageUrl(ctx, await ctx.db.get(post.coverImageId));
}

/** Published news posts, newest first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("news").collect();
    const published = posts
      .filter((p) => p.published)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    return Promise.all(
      published.map(async (p) => ({
        slug: p.slug,
        title: p.title,
        date: p.date,
        excerpt: p.excerpt,
        coverUrl: await coverUrlFor(ctx, p),
      })),
    );
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const post = await ctx.db
      .query("news")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!post || !post.published) return null;
    return {
      slug: post.slug,
      title: post.title,
      date: post.date,
      excerpt: post.excerpt,
      body: post.body,
      coverUrl: await coverUrlFor(ctx, post),
    };
  },
});

// --- admin -----------------------------------------------------------------

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    const posts = await ctx.db.query("news").collect();
    return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    date: v.string(),
    excerpt: v.optional(v.string()),
    body: v.string(),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const existing = await ctx.db
      .query("news")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error(`A post with slug "${args.slug}" exists.`);
    const all = await ctx.db.query("news").collect();
    const maxOrder = all.reduce((m, p) => Math.max(m, p.order), -1);
    return ctx.db.insert("news", {
      slug: args.slug,
      title: args.title,
      date: args.date,
      excerpt: args.excerpt,
      body: args.body,
      published: args.published ?? true,
      order: maxOrder + 1,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("news"),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    date: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    body: v.optional(v.string()),
    published: v.optional(v.boolean()),
    coverImageId: v.optional(v.id("images")),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireAuth(ctx);
    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, clean);
  },
});

export const remove = mutation({
  args: { id: v.id("news") },
  handler: async (ctx, { id }) => {
    await requireAuth(ctx);
    const images = await ctx.db
      .query("images")
      .withIndex("by_news", (q) => q.eq("newsId", id))
      .collect();
    for (const img of images) {
      if (img.provider === "convex" && img.convexStorageId) {
        await ctx.storage.delete(img.convexStorageId);
      }
      await ctx.db.delete(img._id);
    }
    await ctx.db.delete(id);
  },
});
