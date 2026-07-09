import type { Metadata } from "next";
import LocalSeoTemplate from "../local-seo-template";
import { buildPageMetadata } from "@/lib/seo";
import { getLocalSeoPageBySlug } from "@/lib/local-seo-pages";

const slug = "south-kingstown-computer-repair";
const pageData = getLocalSeoPageBySlug(slug);

export const metadata: Metadata = buildPageMetadata({
  title: "South Kingstown Computer Repair | ZeroCool Development",
  description: pageData?.description ?? "South Kingstown computer repair services.",
  path: "/south-kingstown-computer-repair",
});

export default function SouthKingstownComputerRepairPage() {
  if (!pageData) {
    return null;
  }

  return <LocalSeoTemplate page={pageData} path="/south-kingstown-computer-repair" />;
}
