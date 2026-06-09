import type { Metadata } from "next";
import { BioView } from "@/components/BioView";

export const metadata: Metadata = { title: "Biography" };

export default function AboutPage() {
  return <BioView />;
}
