import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib";

/** Read a singleton content blob (home | bio | contact | settings). Public. */
export const get = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const page = await ctx.db
      .query("pages")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    return page?.content ?? null;
  },
});

/** Create or replace a singleton page blob. Admin only. */
export const upsert = mutation({
  args: { key: v.string(), content: v.any() },
  handler: async (ctx, { key, content }) => {
    await requireAuth(ctx);
    const existing = await ctx.db
      .query("pages")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { content });
      return existing._id;
    }
    return ctx.db.insert("pages", { key, content });
  },
});
