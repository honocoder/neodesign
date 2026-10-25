import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://www.agenceneodesign.com",
  trailingSlash: "never",
  output: "static",
  adapter: vercel(),
  redirects: {
    "/pricing": "/tarifs",
    "/about": "/a-propos",
    "/services/web-dev": "/services/site-vitrine",
    "/services/graphisme": "/services/site-vitrine",
    "/services/seo-sea": "/services/site-vitrine",
    "/services/mobile-dev": "/tarifs",
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/404"),
    }),
  ],
});
