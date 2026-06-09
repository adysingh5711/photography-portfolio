import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

// The five content sections of the portfolio, mirroring raulbelinchon.com.
export const sectionValidator = v.union(
  v.literal("portfolio"),
  v.literal("project"),
  v.literal("story"),
  v.literal("publication"),
  v.literal("commission"),
);

// Where the bytes for an image live. "external" is used for seeded
// placeholder URLs; "convex" for uploads to Convex file storage (today);
// "r2" for a future migration to Cloudflare R2 (no page changes needed).
export const providerValidator = v.union(
  v.literal("convex"),
  v.literal("r2"),
  v.literal("external"),
);

export default defineSchema({
  // Convex Auth tables (users, authSessions, authAccounts, ...).
  ...authTables,

  galleries: defineTable({
    section: sectionValidator,
    slug: v.string(),
    title: v.string(),
    subtitle: v.optional(v.string()),
    statement: v.optional(v.string()),
    coverImageId: v.optional(v.id("images")),
    order: v.number(),
    published: v.boolean(),
    isFeatured: v.optional(v.boolean()), // featured on the Home / Recent Work page
    createdAt: v.number(),
  })
    .index("by_section", ["section"])
    .index("by_slug", ["slug"]),

  // Storage-agnostic image records. A single resolveImageUrl() helper turns
  // these into a URL regardless of provider, so swapping Convex -> R2 later
  // only means writing rows with provider:"r2" + r2Key.
  images: defineTable({
    galleryId: v.optional(v.id("galleries")),
    newsId: v.optional(v.id("news")),
    order: v.number(),
    alt: v.optional(v.string()),
    caption: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    blurDataUrl: v.optional(v.string()),
    provider: providerValidator,
    convexStorageId: v.optional(v.id("_storage")),
    r2Key: v.optional(v.string()),
    externalUrl: v.optional(v.string()),
  })
    .index("by_gallery", ["galleryId"])
    .index("by_news", ["newsId"]),

  news: defineTable({
    slug: v.string(),
    title: v.string(),
    date: v.string(), // ISO date string, e.g. "2025-05-01"
    excerpt: v.optional(v.string()),
    body: v.string(),
    coverImageId: v.optional(v.id("images")),
    published: v.boolean(),
    order: v.number(),
  }).index("by_slug", ["slug"]),

  // Singleton content blobs keyed by name: "home" | "bio" | "contact" | "settings".
  pages: defineTable({
    key: v.string(),
    content: v.any(),
  }).index("by_key", ["key"]),
});
