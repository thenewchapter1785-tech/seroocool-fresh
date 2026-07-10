import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import AnalyticsPlaceholders from "./analytics-placeholders";
import MetaPixel from "./meta-pixel";
import HubSpotTracking from "./hubspot-tracking";
import SiteNavigation from "./site-navigation";
import { getContactEmail } from "@/lib/env";
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
          <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
            <div className="footer-grid">
              <div>
                <Image
                  src="/logo.png"
                  alt="ZeroCool Development logo"
                  width={210}
                  height={44}
                  className="footer-logo"
                />
                <p className="site-footer-copy mt-3">Technology Made Simple for Home and Business.</p>
              </div>

              <div>
                <p className="footer-heading">Services</p>
                <ul className="footer-list">
                  <li><Link href="/services/computer-repair">Computer Repair</Link></li>
                  <li><Link href="/services/laptop-repair">Laptop Repair</Link></li>
                  <li><Link href="/services/virus-removal">Virus Removal</Link></li>
                  <li><Link href="/services/wifi-setup">Wi-Fi Help</Link></li>
                  <li><Link href="/services/website-development">Website Development</Link></li>
                  <li><Link href="/services">Business Solutions</Link></li>
                </ul>
              </div>

              <div>
                <p className="footer-heading">Company</p>
                <ul className="footer-list">
                  <li><Link href="/about">About Us</Link></li>
                  <li><Link href="/plans">Pricing</Link></li>
                  <li><Link href="/locations">Service Area</Link></li>
                  <li><Link href="/#reviews">Reviews</Link></li>
                  <li><Link href="/contact">Contact Us</Link></li>
                </ul>
              </div>

              <div>
                <p className="footer-heading">Contact</p>
                <ul className="footer-list">
                  <li><Link href="/book-service">Phone</Link></li>
                  <li><a href={`mailto:${getContactEmail()}`}>{getContactEmail()}</a></li>
                  <li>Rhode Island service area</li>
                  <li>Remote support available</li>
                </ul>
              </div>
            </div>

            <div className="footer-bottom-row">
              <p>© 2026 ZeroCool Development. All rights reserved.</p>
              <div className="footer-bottom-links">
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/terms">Terms of Service</Link>
                <Link href="/sitemap.xml">Sitemap</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
