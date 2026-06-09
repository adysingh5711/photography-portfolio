"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SECTIONS, SECTION_PATH, type SectionKey } from "@/lib/sections";

function NavLink({
  href,
  label,
  active,
  indent,
}: {
  href: string;
  label: string;
  active: boolean;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "block py-1 transition-colors",
        indent ? "pl-3 text-[0.82rem]" : "",
        active ? "text-ink" : "text-muted hover:text-ink",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const settings = useQuery(api.pages.get, { key: "settings" }) as
    | { siteTitle?: string; tagline?: string }
    | null
    | undefined;
  const navItems = useQuery(api.galleries.navItems) ?? [];

  // Which section is active based on the current path.
  const activeSection = SECTIONS.find((s) => pathname.startsWith(s.path))?.key;
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const isOpen = (key: SectionKey) => open[key] ?? key === activeSection;
  const toggle = (key: SectionKey) =>
    setOpen((o) => ({ ...o, [key]: !(o[key] ?? key === activeSection) }));

  const itemsFor = (key: SectionKey) =>
    navItems.filter((i) => i.section === key);

  return (
    <nav className="flex flex-col gap-6 text-sm" onClick={onNavigate}>
      <div>
        <Link href="/" className="block leading-tight">
          <span className="text-base tracking-wide text-ink">
            {settings?.siteTitle ?? "Raúl Belinchón"}
          </span>
          <span className="block nav-label text-muted mt-1">
            {settings?.tagline ?? "Photographer"}
          </span>
        </Link>
      </div>

      <div className="flex flex-col">
        <NavLink href="/portfolio" label="Portfolio" active={pathname === "/portfolio"} />

        {SECTIONS.map((section) => {
          const items = itemsFor(section.key);
          const expanded = isOpen(section.key);
          return (
            <div key={section.key}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(section.key);
                }}
                className={[
                  "flex w-full items-center justify-between py-1 text-left transition-colors",
                  activeSection === section.key
                    ? "text-ink"
                    : "text-muted hover:text-ink",
                ].join(" ")}
              >
                <span>{section.label}</span>
                <span className="text-[0.65rem] text-muted">
                  {expanded ? "–" : "+"}
                </span>
              </button>
              {expanded && items.length > 0 && (
                <div className="mb-1 flex flex-col">
                  {items.map((item) => {
                    const href = `${SECTION_PATH[section.key]}/${item.slug}`;
                    return (
                      <NavLink
                        key={item.slug}
                        href={href}
                        label={item.title}
                        active={pathname === href}
                        indent
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col">
        <span className="nav-label text-muted py-1">Info</span>
        <NavLink href="/about" label="Biography" active={pathname === "/about"} indent />
        <NavLink href="/news" label="News" active={pathname.startsWith("/news")} indent />
      </div>

      <NavLink href="/contact" label="Contact" active={pathname === "/contact"} />
    </nav>
  );
}
