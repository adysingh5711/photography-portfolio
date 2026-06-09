import { z } from "zod";

/**
 * Zod-validated environment for the Convex deployment runtime.
 *
 * These are set ON the deployment (`npx convex env set ...`), not in .env files.
 * All are optional so a deploy never fails on a missing value — but anything that
 * IS present is shape-checked (e.g. a malformed R2 URL is rejected).
 */
const schema = z.object({
  // Provided automatically by Convex; used by auth.config.ts.
  CONVEX_SITE_URL: z.url().optional(),
  // Gate for creating the single owner account (auth sign-up).
  ADMIN_SIGNUP_KEY: z.string().min(1).optional(),
  // Public base URL of the Cloudflare R2 bucket (future image migration).
  R2_PUBLIC_URL: z.url().optional(),
});

export const env = schema.parse({
  CONVEX_SITE_URL: process.env.CONVEX_SITE_URL,
  ADMIN_SIGNUP_KEY: process.env.ADMIN_SIGNUP_KEY,
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
});
