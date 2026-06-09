import type { Metadata } from "next";
import { SectionIndex } from "@/components/SectionIndex";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return <SectionIndex section="project" title="Projects" basePath="/projects" />;
}
