"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <h1 className="text-xl tracking-wide text-ink">Admin</h1>
      <p className="mt-1 nav-label text-muted">
        {flow === "signIn" ? "Sign in to manage content" : "Create the owner account"}
      </p>

      <form
        className="mt-6 flex flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setBusy(true);
          const fd = new FormData(e.currentTarget);
          const data = {
            email: String(fd.get("email") ?? ""),
            password: String(fd.get("password") ?? ""),
            flow,
            name: String(fd.get("name") ?? ""),
            signupKey: String(fd.get("signupKey") ?? ""),
          };
          try {
            await signIn("password", data);
          } catch {
            setError(
              flow === "signIn"
                ? "Invalid email or password."
                : "Could not create account. Check the signup key.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {flow === "signUp" && (
          <input
            name="name"
            placeholder="Name"
            className="border border-faint px-3 py-2 outline-none focus:border-ink"
          />
        )}
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="border border-faint px-3 py-2 outline-none focus:border-ink"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="border border-faint px-3 py-2 outline-none focus:border-ink"
        />
        {flow === "signUp" && (
          <input
            name="signupKey"
            placeholder="Signup key"
            className="border border-faint px-3 py-2 outline-none focus:border-ink"
          />
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="bg-ink px-3 py-2 text-ground disabled:opacity-50"
        >
          {busy ? "…" : flow === "signIn" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        type="button"
        className="mt-4 nav-label text-muted hover:text-ink"
        onClick={() => {
          setError(null);
          setFlow((f) => (f === "signIn" ? "signUp" : "signIn"));
        }}
      >
        {flow === "signIn"
          ? "Need to create the owner account?"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
