import type { Metadata } from "next";
import LocalSeoTemplate from "../local-seo-template";
import { buildPageMetadata } from "@/lib/seo";
import { getLocalSeoPageBySlug } from "@/lib/local-seo-pages";

const slug = "warwick-computer-repair";
const pageData = getLocalSeoPageBySlug(slug);

export const metadata: Metadata = buildPageMetadata({
  title: "Warwick Computer Repair | ZeroCool Development",
  description: pageData?.description ?? "Warwick computer repair services.",
  path: "/warwick-computer-repair",
});

export default function WarwickComputerRepairPage() {
  if (!pageData) {
    return null;
  }

  return <LocalSeoTemplate page={pageData} path="/warwick-computer-repair" />;
}
