import type { Metadata } from "next";
import { PortfolioIndex } from "@/components/PortfolioIndex";

export const metadata: Metadata = { title: "Portfolio" };

export default function PortfolioPage() {
  return <PortfolioIndex />;
}
