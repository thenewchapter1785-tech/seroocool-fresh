import type { Metadata } from "next";
import LocalSeoTemplate from "../local-seo-template";
import { buildPageMetadata } from "@/lib/seo";
import { getLocalSeoPageBySlug } from "@/lib/local-seo-pages";

const slug = "wakefield-tech-support";
const pageData = getLocalSeoPageBySlug(slug);

export const metadata: Metadata = buildPageMetadata({
  title: "Wakefield Tech Support | ZeroCool Development",
  description: pageData?.description ?? "Wakefield tech support services.",
  path: "/wakefield-tech-support",
});

export default function WakefieldTechSupportPage() {
  if (!pageData) {
    return null;
  }

  return <LocalSeoTemplate page={pageData} path="/wakefield-tech-support" />;
}
