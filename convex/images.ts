import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, resolveImage } from "./lib";

/** Returns a short-lived upload URL. Client POSTs the file bytes to it. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Record an uploaded (or external) image against a gallery or news post. */
export const addImage = mutation({
  args: {
    galleryId: v.optional(v.id("galleries")),
    newsId: v.optional(v.id("news")),
    storageId: v.optional(v.id("_storage")),
    externalUrl: v.optional(v.string()),
    alt: v.optional(v.string()),
    caption: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    blurDataUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    if (!args.galleryId && !args.newsId) {
      throw new Error("addImage requires a galleryId or newsId");
    }
    // Determine next order within the owning gallery.
    let order = 0;
    if (args.galleryId) {
      const siblings = await ctx.db
        .query("images")
        .withIndex("by_gallery", (q) => q.eq("galleryId", args.galleryId))
        .collect();
      order = siblings.reduce((m, i) => Math.max(m, i.order), -1) + 1;
    }
    const provider = args.storageId ? ("convex" as const) : ("external" as const);
    return ctx.db.insert("images", {
      galleryId: args.galleryId,
      newsId: args.newsId,
      order,
      alt: args.alt,
      caption: args.caption,
      width: args.width,
      height: args.height,
      blurDataUrl: args.blurDataUrl,
      provider,
      convexStorageId: args.storageId,
      externalUrl: args.externalUrl,
    });
  },
});

export const updateImage = mutation({
  args: {
    id: v.id("images"),
    alt: v.optional(v.string()),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireAuth(ctx);
    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, clean);
  },
});

export const removeImage = mutation({
  args: { id: v.id("images") },
  handler: async (ctx, { id }) => {
    await requireAuth(ctx);
    const img = await ctx.db.get(id);
    if (!img) return;
    if (img.provider === "convex" && img.convexStorageId) {
      await ctx.storage.delete(img.convexStorageId);
    }
    await ctx.db.delete(id);
  },
});

export const reorder = mutation({
  args: { orderedIds: v.array(v.id("images")) },
  handler: async (ctx, { orderedIds }) => {
    await requireAuth(ctx);
    await Promise.all(
      orderedIds.map((id, i) => ctx.db.patch(id, { order: i })),
    );
  },
});

/** Resolved images for a news post (gallery images come back via galleries.getBySlug). */
export const listByNews = query({
  args: { newsId: v.id("news") },
  handler: async (ctx, { newsId }) => {
    const images = await ctx.db
      .query("images")
      .withIndex("by_news", (q) => q.eq("newsId", newsId))
      .collect();
    images.sort((a, b) => a.order - b.order);
    return (
      await Promise.all(images.map((img) => resolveImage(ctx, img)))
    ).filter((x): x is NonNullable<typeof x> => x !== null);
  },
});
