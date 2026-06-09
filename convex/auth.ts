import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { env } from "./env";

// Single-owner portfolio. Sign-in is always allowed; sign-up is gated behind a
// shared secret (ADMIN_SIGNUP_KEY env var on the Convex deployment) so random
// visitors cannot register an admin account. Register once after deploy, then
// you may unset the key.
const ADMIN_SIGNUP_KEY = env.ADMIN_SIGNUP_KEY;

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        // `profile` runs when an account is created (the sign-up flow).
        if (params.flow === "signUp") {
          if (!ADMIN_SIGNUP_KEY || params.signupKey !== ADMIN_SIGNUP_KEY) {
            throw new ConvexError(
              "Sign-up is disabled. Provide a valid signup key.",
            );
          }
        }
        const profile: { email: string; name?: string } = {
          email: params.email as string,
        };
        if (typeof params.name === "string" && params.name.length > 0) {
          profile.name = params.name;
        }
        return profile;
      },
    }),
  ],
});
