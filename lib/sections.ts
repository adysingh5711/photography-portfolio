export type SectionKey =
  | "portfolio"
  | "project"
  | "story"
  | "publication"
  | "commission";

// Expandable content sections in the sidebar, in display order.
export const SECTIONS: { key: SectionKey; label: string; path: string }[] = [
  { key: "project", label: "Projects", path: "/projects" },
  { key: "story", label: "Stories", path: "/stories" },
  { key: "publication", label: "Publications", path: "/publications" },
  { key: "commission", label: "Commissions", path: "/commissions" },
];

export const SECTION_LABEL: Record<SectionKey, string> = {
  portfolio: "Portfolio",
  project: "Projects",
  story: "Stories",
  publication: "Publications",
  commission: "Commissions",
};

// Map a section key to the public base path for its galleries.
export const SECTION_PATH: Record<SectionKey, string> = {
  portfolio: "/portfolio",
  project: "/projects",
  story: "/stories",
  publication: "/publications",
  commission: "/commissions",
};
