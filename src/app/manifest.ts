import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ahem Corporation — Construction, Civil Engineering & Infrastructure",
    short_name: "Ahem Corporation",
    description: "Construction, engineering and infrastructure company delivering public works and private projects.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1a2b",
    theme_color: "#10243a",
    icons: [
      { src: "/brand/ahem-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
