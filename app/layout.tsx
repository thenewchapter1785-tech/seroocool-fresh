import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import AnalyticsPlaceholders from "./analytics-placeholders";
import MetaPixel from "./meta-pixel";
import HubSpotTracking from "./hubspot-tracking";
import SiteNavigation from "./site-navigation";
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
const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ??
  process.env.GOOGLE_SITE_VERIFICATION ??
  "";
const facebookDomainVerification =
  process.env.FACEBOOK_DOMAIN_VERIFICATION ?? "";
const siteName = "ZeroCool Development";
const defaultTitle = "ZeroCool Development | Computer Repair and Tech Support";
const defaultDescription =
  "ZeroCool Development provides computer repair and tech support in plain English, plus websites, apps, automation, and business tech help for owners.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | ZeroCool Development",
  },
  description: defaultDescription,
  icons: {
    icon: [
      {
        url: "/logo.png",
        type: "image/png",
      },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
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
    "ZeroCool Development",
    "computer repair",
    "laptop repair",
    "virus removal",
    "wifi problems",
    "tech support",
    "rhode island tech support",
    "web development",
    "app development",
    "business automation",
    "ai integration",
    "technology consulting",
    "business software help",
    "custom software development",
    "small business web development",
    "next.js development",
    "crm integrations",
    "mobile app development",
    "website automation",
    "ai assistant integration",
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
        alt: "ZeroCool Development computer repair and tech support",
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
        <AnalyticsPlaceholders />
        <HubSpotTracking />
        <MetaPixel />
        <SiteNavigation />
        <div className="flex-1">{children}</div>
        <footer className="site-footer">
          <div className="mx-auto w-full max-w-6xl px-6 py-6 md:px-10">
            <p className="site-footer-title">Technology Made Simple for Home and Business.</p>
            <p className="site-footer-copy mt-2">
              Honest service. Fair pricing. No confusing tech talk. Serving Rhode Island with local
              and remote support.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
