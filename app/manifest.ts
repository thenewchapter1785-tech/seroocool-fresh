import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ZeroCool Development",
    short_name: "ZeroCool Dev",
    description:
      "Web development, app development, automation, AI integration, and consulting for modern businesses.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0f14",
    theme_color: "#2f80ff",
    icons: [
      {
        src: "/logo.png",
        sizes: "1536x1024",
        type: "image/png",
      },
    ],
  };
}
