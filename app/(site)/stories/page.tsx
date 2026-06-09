import type { Metadata } from "next";
import { SectionIndex } from "@/components/SectionIndex";

export const metadata: Metadata = { title: "Stories" };

export default function StoriesPage() {
  return <SectionIndex section="story" title="Stories" basePath="/stories" />;
}
