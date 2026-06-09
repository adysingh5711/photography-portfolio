import { query, mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id, Doc } from "./_generated/dataModel";
import { sectionValidator } from "./schema";
import { requireAuth, resolveImage, resolveImageUrl } from "./lib";

// --- helpers ---------------------------------------------------------------

async function coverUrlFor(
  ctx: QueryCtx,
  gallery: Doc<"galleries">,
): Promise<string | null> {
  if (gallery.coverImageId) {
    const cover = await ctx.db.get(gallery.coverImageId);
    const url = await resolveImageUrl(ctx, cover);
    if (url) return url;
  }
  // Fall back to the first image in the gallery.
  const images = await ctx.db
    .query("images")
    .withIndex("by_gallery", (q) => q.eq("galleryId", gallery._id))
    .collect();
  images.sort((a, b) => a.order - b.order);
  return resolveImageUrl(ctx, images[0]);
}

function galleryCard(gallery: Doc<"galleries">, coverUrl: string | null) {
  return {
    _id: gallery._id,
    section: gallery.section,
    slug: gallery.slug,
    title: gallery.title,
    subtitle: gallery.subtitle,
    order: gallery.order,
    coverUrl,
  };
}

// --- public queries --------------------------------------------------------

/** All published galleries in a section, ordered, each with a cover image URL. */
export const listSection = query({
  args: { section: sectionValidator },
  handler: async (ctx, { section }) => {
    const galleries = await ctx.db
      .query("galleries")
      .withIndex("by_section", (q) => q.eq("section", section))
      .collect();
    const published = galleries
      .filter((g) => g.published)
      .sort((a, b) => a.order - b.order);
    return Promise.all(
      published.map(async (g) => galleryCard(g, await coverUrlFor(ctx, g))),
    );
  },
});

/** Every published gallery across all sections, with covers — the Portfolio grid. */
export const portfolio = query({
  args: {},
  handler: async (ctx) => {
    const galleries = await ctx.db.query("galleries").collect();
    const published = galleries
      .filter((g) => g.published)
      .sort((a, b) => a.order - b.order);
    return Promise.all(
      published.map(async (g) => ({
        ...galleryCard(g, await coverUrlFor(ctx, g)),
        // Portfolio links resolve to the gallery's own section path.
      })),
    );
  },
});

/** Lightweight list of every published gallery, for building the nav menu. */
export const navItems = query({
  args: {},
  handler: async (ctx) => {
    const galleries = await ctx.db.query("galleries").collect();
    return galleries
      .filter((g) => g.published)
      .sort((a, b) => a.order - b.order)
      .map((g) => ({
        section: g.section,
        slug: g.slug,
        title: g.title,
      }));
  },
});

/** A single gallery by slug, with all of its images resolved to URLs. */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const gallery = await ctx.db
      .query("galleries")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!gallery || !gallery.published) return null;
    const images = await ctx.db
      .query("images")
      .withIndex("by_gallery", (q) => q.eq("galleryId", gallery._id))
      .collect();
    images.sort((a, b) => a.order - b.order);
    const resolved = (
      await Promise.all(images.map((img) => resolveImage(ctx, img)))
    ).filter((x): x is NonNullable<typeof x> => x !== null);
    return {
      _id: gallery._id,
      section: gallery.section,
      slug: gallery.slug,
      title: gallery.title,
      subtitle: gallery.subtitle,
      statement: gallery.statement,
      images: resolved,
    };
  },
});

/** The featured gallery shown on the Home / Recent Work page. */
export const featured = query({
  args: {},
  handler: async (ctx) => {
    const galleries = await ctx.db.query("galleries").collect();
    const featuredGallery =
      galleries
        .filter((g) => g.published && g.isFeatured)
        .sort((a, b) => a.order - b.order)[0] ??
      galleries
        .filter((g) => g.published)
        .sort((a, b) => b.createdAt - a.createdAt)[0];
    if (!featuredGallery) return null;
    const images = await ctx.db
      .query("images")
      .withIndex("by_gallery", (q) => q.eq("galleryId", featuredGallery._id))
      .collect();
    images.sort((a, b) => a.order - b.order);
    const resolved = (
      await Promise.all(images.map((img) => resolveImage(ctx, img)))
    ).filter((x): x is NonNullable<typeof x> => x !== null);
    return {
      slug: featuredGallery.slug,
      section: featuredGallery.section,
      title: featuredGallery.title,
      subtitle: featuredGallery.subtitle,
      statement: featuredGallery.statement,
      images: resolved,
    };
  },
});

// --- admin queries ---------------------------------------------------------

/** Every gallery (published or not). Admin only. */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    const galleries = await ctx.db.query("galleries").collect();
    return Promise.all(
      galleries
        .sort((a, b) => a.order - b.order)
        .map(async (g) => ({
          ...g,
          coverUrl: await coverUrlFor(ctx, g),
        })),
    );
  },
});

export const getById = query({
  args: { id: v.id("galleries") },
  handler: async (ctx, { id }) => {
    await requireAuth(ctx);
    const gallery = await ctx.db.get(id);
    if (!gallery) return null;
    const images = await ctx.db
      .query("images")
      .withIndex("by_gallery", (q) => q.eq("galleryId", id))
      .collect();
    images.sort((a, b) => a.order - b.order);
    const resolved = (
      await Promise.all(images.map((img) => resolveImage(ctx, img)))
    ).filter((x): x is NonNullable<typeof x> => x !== null);
    return { ...gallery, images: resolved };
  },
});

// --- admin mutations -------------------------------------------------------

export const create = mutation({
  args: {
    section: sectionValidator,
    slug: v.string(),
    title: v.string(),
    subtitle: v.optional(v.string()),
    statement: v.optional(v.string()),
    published: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const existing = await ctx.db
      .query("galleries")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error(`A gallery with slug "${args.slug}" exists.`);
    const all = await ctx.db.query("galleries").collect();
    const maxOrder = all.reduce((m, g) => Math.max(m, g.order), -1);
    return ctx.db.insert("galleries", {
      section: args.section,
      slug: args.slug,
      title: args.title,
      subtitle: args.subtitle,
      statement: args.statement,
      published: args.published ?? true,
      isFeatured: args.isFeatured ?? false,
      order: maxOrder + 1,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("galleries"),
    section: v.optional(sectionValidator),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    statement: v.optional(v.string()),
    published: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
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

export const reorder = mutation({
  args: { orderedIds: v.array(v.id("galleries")) },
  handler: async (ctx, { orderedIds }) => {
    await requireAuth(ctx);
    await Promise.all(
      orderedIds.map((id, i) => ctx.db.patch(id, { order: i })),
    );
  },
});

export const remove = mutation({
  args: { id: v.id("galleries") },
  handler: async (ctx, { id }) => {
    await requireAuth(ctx);
    const images = await ctx.db
      .query("images")
      .withIndex("by_gallery", (q) => q.eq("galleryId", id))
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
