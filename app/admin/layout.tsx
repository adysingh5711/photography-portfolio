"use client";

import { ReactNode } from "react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInForm } from "@/components/admin/SignInForm";
import { AdminChrome } from "@/components/admin/AdminChrome";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <AuthLoading>
        <div className="px-6 py-24 text-muted">Loading…</div>
      </AuthLoading>
      <Unauthenticated>
        <div className="mx-auto max-w-sm px-6 py-24">
          <SignInForm />
        </div>
      </Unauthenticated>
      <Authenticated>
        <AdminChrome>{children}</AdminChrome>
      </Authenticated>
    </div>
  );
}
