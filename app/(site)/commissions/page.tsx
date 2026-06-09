import type { Metadata } from "next";
import { SectionIndex } from "@/components/SectionIndex";

export const metadata: Metadata = { title: "Commissions" };

export default function CommissionsPage() {
  return (
    <SectionIndex
      section="commission"
      title="Commissions"
      basePath="/commissions"
    />
  );
}
