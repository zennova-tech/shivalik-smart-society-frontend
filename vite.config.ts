// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development";

  return {
    server: {
      host: "::",
      port: 3000,
    },
    plugins: [
      react(),
      isDev && componentTagger(),
      VitePWA({
        registerType: "autoUpdate", // automatically update in background
        includeAssets: [
          "favicon.svg",
          "robots.txt",
          "apple-touch-icon.png",
          "pwa-192x192.png",
          "pwa-512x512.png",
        ],
        manifest: {
          name: "R-OS Admin Dashboard",
          short_name: "R-OS",
          description: "R-OS Admin - Real Estate Management System",
          lang: "en",
          start_url: "/",
          scope: "/",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#0066ff",
          icons: [
            { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
            {
              src: "pwa-512x512-maskable.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          // include basic assets. adjust globPatterns if you have other file types
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
          runtimeCaching: [
            // HTML navigations - network first (app shell + updates)
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "html-pages",
                expiration: { maxEntries: 10, maxAgeSeconds: 24 * 60 * 60 },
              },
            },
            // Static resources - cache first
            {
              urlPattern: ({ request }) =>
                request.destination === "script" ||
                request.destination === "style" ||
                request.destination === "font" ||
                request.destination === "image",
              handler: "CacheFirst",
              options: {
                cacheName: "static-resources",
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                },
              },
            },
            // API calls: network first, fallback to cache
            {
              // change this if your API lives on a different host; this matches same-origin /api/ paths
              urlPattern: /^\/api\/.*$/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-responses",
                networkTimeoutSeconds: 10,
                expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 },
              },
            },
          ],
          navigateFallback: "/offline.html", // serve offline page for failed navigations
        },
        devOptions: {
          enabled: isDev, // if you want to test SW during dev, keep true; set false to disable
          type: "module",
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env": env,
    },
  };
});
