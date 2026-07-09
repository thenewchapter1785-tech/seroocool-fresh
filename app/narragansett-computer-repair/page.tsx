import type { Metadata } from "next";
import LocalSeoTemplate from "../local-seo-template";
import { buildPageMetadata } from "@/lib/seo";
import { getLocalSeoPageBySlug } from "@/lib/local-seo-pages";

const slug = "narragansett-computer-repair";
const pageData = getLocalSeoPageBySlug(slug);

export const metadata: Metadata = buildPageMetadata({
  title: "Narragansett Computer Repair | ZeroCool Development",
  description: pageData?.description ?? "Narragansett computer repair services.",
  path: "/narragansett-computer-repair",
});

export default function NarragansettComputerRepairPage() {
  if (!pageData) {
    return null;
  }

  return <LocalSeoTemplate page={pageData} path="/narragansett-computer-repair" />;
}
