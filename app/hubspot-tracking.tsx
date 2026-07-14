"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const PRIVATE_PATH_PREFIXES = ["/admin", "/client-portal"];

export default function HubSpotTracking() {
  const pathname = usePathname();
  const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;
  const isPrivatePath = PRIVATE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!portalId || isPrivatePath) {
    return null;
  }

  return (
    <Script
      id="hubspot-tracking"
      strategy="afterInteractive"
      src={`https://js.hs-scripts.com/${portalId}.js`}
    />
  );
}
