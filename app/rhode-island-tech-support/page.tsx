import type { Metadata } from "next";
import LocalSeoTemplate from "../local-seo-template";
import { buildPageMetadata } from "@/lib/seo";
import { getLocalSeoPageBySlug } from "@/lib/local-seo-pages";

const slug = "rhode-island-tech-support";
const pageData = getLocalSeoPageBySlug(slug);

export const metadata: Metadata = buildPageMetadata({
  title: "Rhode Island Tech Support | ZeroCool Development",
  description:
    pageData?.description ?? "Rhode Island technology support services.",
  path: "/rhode-island-tech-support",
});

export default function RhodeIslandTechSupportPage() {
  if (!pageData) {
    return null;
  }

  return <LocalSeoTemplate page={pageData} path="/rhode-island-tech-support" />;
}
