"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/galleries", label: "Galleries" },
  { href: "/admin/news", label: "News" },
  { href: "/admin/pages", label: "Pages" },
];

export function AdminChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useAuthActions();

  return (
    <div>
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-faint px-6 py-4">
        <span className="tracking-wide text-ink">Raúl Belinchón · CMS</span>
        <nav className="flex gap-4 text-sm">
          {LINKS.map((l) => {
            const active =
              l.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={active ? "text-ink" : "text-muted hover:text-ink"}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <Link href="/" className="text-muted hover:text-ink" target="_blank">
            View site ↗
          </Link>
          <button
            onClick={() => signOut()}
            className="nav-label text-muted hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="px-6 py-8 max-w-[1100px]">{children}</main>
    </div>
  );
}
