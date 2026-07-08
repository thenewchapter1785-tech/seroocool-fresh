import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import MetaPixel from "./meta-pixel";
import HubSpotTracking from "./hubspot-tracking";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zerocool-development.com";
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION ?? "";
const facebookDomainVerification =
  process.env.FACEBOOK_DOMAIN_VERIFICATION ?? "";
const siteName = "$erocool-Development";
const defaultTitle = "$erocool-Development | Full-Stack Developer";
const defaultDescription =
  "Business websites, web apps, and automation systems by $erocool-Development. Full-stack delivery built to launch fast, convert visitors, and support long-term growth.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | $erocool-Development",
  },
  description: defaultDescription,
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  keywords: [
    "$erocool-Development",
    "$erocool",
    "full-stack developer",
    "software developer portfolio",
    "business website development",
    "web app development",
    "API integrations",
    "website developer",
    "automation developer",
    "small business website developer",
    "landing page developer",
    "web design",
    "automation",
  ],
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    siteName,
    url: "/",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "$erocool-Development full-stack developer profile card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/og-image.svg"],
  },
  verification:
    googleSiteVerification || facebookDomainVerification
      ? {
          google: googleSiteVerification || undefined,
          other: facebookDomainVerification
            ? {
                "facebook-domain-verification": facebookDomainVerification,
              }
            : undefined,
        }
      : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <HubSpotTracking />
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
