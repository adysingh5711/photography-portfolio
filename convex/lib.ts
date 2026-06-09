import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";
import { QueryCtx, MutationCtx } from "./_generated/server";
import { env } from "./env";

/**
 * Resolve a storage-agnostic image record to a public URL.
 *
 * This is THE single place that knows where image bytes live. Migrating from
 * Convex file storage to Cloudflare R2 later only requires writing rows with
 * provider:"r2" + r2Key and setting R2_PUBLIC_URL — no caller changes.
 */
export async function resolveImageUrl(
  ctx: QueryCtx | MutationCtx,
  image: Doc<"images"> | null | undefined,
): Promise<string | null> {
  if (!image) return null;
  if (image.provider === "external") {
    return image.externalUrl ?? null;
  }
  if (image.provider === "r2") {
    const base = env.R2_PUBLIC_URL;
    return base && image.r2Key ? `${base}/${image.r2Key}` : null;
  }
  // provider === "convex"
  if (image.convexStorageId) {
    return await ctx.storage.getUrl(image.convexStorageId);
  }
  return null;
}

/** A view of an image with its resolved URL, used by the public site. */
export type ResolvedImage = {
  _id: Doc<"images">["_id"];
  url: string | null;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  blurDataUrl?: string;
  order: number;
};

export async function resolveImage(
  ctx: QueryCtx | MutationCtx,
  image: Doc<"images"> | null | undefined,
): Promise<ResolvedImage | null> {
  if (!image) return null;
  return {
    _id: image._id,
    url: await resolveImageUrl(ctx, image),
    alt: image.alt ?? "",
    caption: image.caption,
    width: image.width,
    height: image.height,
    blurDataUrl: image.blurDataUrl,
    order: image.order,
  };
}

/** Throw unless the caller is signed in. Use in every admin mutation/query. */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Not authenticated");
  }
  return userId;
}
