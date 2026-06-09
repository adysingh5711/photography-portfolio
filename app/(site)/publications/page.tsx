import type { Metadata } from "next";
import { SectionIndex } from "@/components/SectionIndex";

export const metadata: Metadata = { title: "Publications" };

export default function PublicationsPage() {
  return (
    <SectionIndex
      section="publication"
      title="Publications"
      basePath="/publications"
    />
  );
}
