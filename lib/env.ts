import { z } from "zod";

/**
 * Zod-validated environment for the Next.js app.
 *
 * - Client vars (NEXT_PUBLIC_*) are referenced as literals below so Next inlines
 *   them into the browser bundle; they are validated on both server and client.
 * - Server-only vars are validated only on the server (never shipped to the client).
 * Invalid/missing required vars throw at import time — failing fast.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_CONVEX_URL: z.url(),
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
});

const serverSchema = z.object({
  // Only needed on Vercel for the `convex deploy --cmd` build step.
  CONVEX_DEPLOY_KEY: z.string().min(1).optional(),
});

function parse<T extends z.ZodType>(schema: T, values: unknown): z.infer<T> {
  const result = schema.safeParse(values);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return result.data;
}

const clientEnv = parse(clientSchema, {
  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

const serverEnv =
  typeof window === "undefined"
    ? parse(serverSchema, { CONVEX_DEPLOY_KEY: process.env.CONVEX_DEPLOY_KEY })
    : ({} as z.infer<typeof serverSchema>);

export const env = { ...clientEnv, ...serverEnv };

/** Public site origin, used by robots.txt / sitemap.xml. */
export const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
