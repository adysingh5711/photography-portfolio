// NOTE: read process.env directly here — Convex statically scans this file's
// import graph for `process.env.*` and treats every reference as a REQUIRED
// deployment var. Importing convex/env.ts would make it demand the optional
// vars (e.g. R2_PUBLIC_URL). CONVEX_SITE_URL is always provided by Convex.
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
