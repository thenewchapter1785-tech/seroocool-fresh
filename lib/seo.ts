import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const absoluteUrl = `${siteUrl}${input.path}`;
  const socialImageUrl = `${siteUrl}/og-image.svg`;

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: absoluteUrl,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: absoluteUrl,
      siteName: "ZeroCool Development",
      type: "website",
      images: [
        {
          url: socialImageUrl,
          width: 1200,
          height: 630,
          alt: "ZeroCool Development services preview",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [socialImageUrl],
    },
  };
}
