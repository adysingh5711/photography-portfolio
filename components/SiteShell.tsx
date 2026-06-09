"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { SidebarNav } from "./SidebarNav";

export function SiteShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-faint bg-ground/90 px-5 py-3 backdrop-blur">
        <Link href="/" className="tracking-wide" onClick={() => setMobileOpen(false)}>
          Raúl Belinchón
        </Link>
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="nav-label text-muted"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </header>

      {/* Desktop fixed sidebar */}
      <aside className="hidden md:block fixed inset-y-0 left-0 w-56 overflow-y-auto px-7 py-10">
        <SidebarNav />
      </aside>

      {/* Mobile slide-down nav */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-[49px] z-20 overflow-y-auto bg-ground px-7 py-8">
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <main className="md:ml-56 px-5 md:px-12 py-8 md:py-12 max-w-[1400px]">
        {children}
        <footer className="mt-24 pt-6 nav-label text-muted">
          © {new Date().getFullYear()} Raúl Belinchón
        </footer>
      </main>
    </div>
  );
}
