import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Maraude Paris",
    short_name: "Maraude Paris",
    description:
      "La carte des maraudes solidaires à Paris : Emmaüs, La Chorba, Aurore, Samu Social, Enfants du Canal.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1a1a2e",
    theme_color: "#1a1a2e",
    categories: ["social", "navigation"],
    lang: "fr",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [],
  };
}
