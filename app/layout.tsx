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
const siteName = "ZeroCool Development";
const defaultTitle = "ZeroCool Development | Web, Apps, Automation, AI Integration";
const defaultDescription =
  "ZeroCool Development delivers web development, app development, automation, AI integration, and consulting for businesses that need secure, modern digital solutions.";

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
    "web development",
    "app development",
    "business automation",
    "ai integration",
    "technology consulting",
    "business software solutions",
    "custom software development",
    "digital transformation",
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
        alt: "ZeroCool Development technology services profile card",
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
