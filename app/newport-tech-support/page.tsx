import type { Metadata } from "next";
import LocalSeoTemplate from "../local-seo-template";
import { buildPageMetadata } from "@/lib/seo";
import { getLocalSeoPageBySlug } from "@/lib/local-seo-pages";

const slug = "newport-tech-support";
const pageData = getLocalSeoPageBySlug(slug);

export const metadata: Metadata = buildPageMetadata({
  title: "Newport Tech Support | ZeroCool Development",
  description: pageData?.description ?? "Newport tech support services.",
  path: "/newport-tech-support",
});

export default function NewportTechSupportPage() {
  if (!pageData) {
    return null;
  }

  return <LocalSeoTemplate page={pageData} path="/newport-tech-support" />;
}
