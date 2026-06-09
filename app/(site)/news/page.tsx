import type { Metadata } from "next";
import { NewsList } from "@/components/NewsList";

export const metadata: Metadata = { title: "News" };

export default function NewsPage() {
  return <NewsList />;
}
