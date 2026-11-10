import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ahem Corporation — Construction, Civil Engineering & Infrastructure",
    short_name: "Ahem Corporation",
    description: "Construction, engineering and infrastructure company delivering public works and private projects.",
    start_url: "/",
    display: "standalone",
    background_color: "#15191d",
    theme_color: "#142b40",
    icons: [
      { src: "/brand/ahem-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
