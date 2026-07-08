import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "$erocool",
    short_name: "$erocool",
    description:
      "Business websites, web apps, and automation by $erocool.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/next.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
