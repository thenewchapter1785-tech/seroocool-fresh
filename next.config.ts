import type { NextConfig } from "next";
import { getSiteUrl } from "./lib/env";

const isDevelopment = process.env.NODE_ENV !== "production";
const canonicalSiteUrl = getSiteUrl();
const canonicalHost = new URL(canonicalSiteUrl).host;
const canonicalHostWithoutWww = canonicalHost.startsWith("www.")
  ? canonicalHost.slice(4)
  : canonicalHost;

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(isDevelopment ? ["'unsafe-eval'"] : []),
  "https://js.hs-scripts.com",
  "https://js-na2.hs-scripts.com",
  "https://js-na2.hs-banner.com",
  "https://js-na2.hs-analytics.net",
  "https://js-na2.hscollectedforms.net",
  "https://connect.facebook.net",
  "https://www.googletagmanager.com",
  "https://www.clarity.ms",
].join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.facebook.com https://www.google-analytics.com https://www.googletagmanager.com https://track-na2.hubspot.com https://forms-na2.hsforms.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.hubapi.com https://www.facebook.com https://connect.facebook.net https://www.google-analytics.com https://region1.google-analytics.com https://www.clarity.ms https://forms-na2.hscollectedforms.net",
  "frame-src 'self' https://js.hsforms.net https://forms.hsforms.com",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-site",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "off",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    if (isDevelopment) {
      return [];
    }

    return [
      {
        source: "/:path*",
        has: [
          {
            type: "header",
            key: "x-forwarded-proto",
            value: "http",
          },
        ],
        destination: `${canonicalSiteUrl}/:path*`,
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: `www.${canonicalHostWithoutWww}`,
          },
        ],
        destination: `${canonicalSiteUrl}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
