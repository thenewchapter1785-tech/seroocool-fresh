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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
const facebookDomainVerification =
  process.env.FACEBOOK_DOMAIN_VERIFICATION ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "$erocool | Full-Stack Developer",
  description:
    "Professional portfolio and resume for $erocool, showcasing web, mobile, and software development services.",
  keywords: [
    "$erocool",
    "programming",
    "hacker name",
    "full-stack developer",
    "web design",
    "android apps",
    "digital creator",
  ],
  openGraph: {
    title: "$erocool | Full-Stack Developer",
    description:
      "Programming name: $erocool. Full-stack web, mobile, and software solutions for modern businesses.",
    siteName: "$erocool",
    url: "/",
    type: "website",
  },
  verification: facebookDomainVerification
    ? {
        other: {
          "facebook-domain-verification": facebookDomainVerification,
        },
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
