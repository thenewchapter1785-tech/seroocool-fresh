import type { Metadata } from "next";
import LocalSeoTemplate from "../local-seo-template";
import { buildPageMetadata } from "@/lib/seo";
import { getLocalSeoPageBySlug } from "@/lib/local-seo-pages";

const slug = "providence-tech-support";
const pageData = getLocalSeoPageBySlug(slug);

export const metadata: Metadata = buildPageMetadata({
  title: "Providence Tech Support | ZeroCool Development",
  description: pageData?.description ?? "Providence tech support services.",
  path: "/providence-tech-support",
});

export default function ProvidenceTechSupportPage() {
  if (!pageData) {
    return null;
  }

  return <LocalSeoTemplate page={pageData} path="/providence-tech-support" />;
}
