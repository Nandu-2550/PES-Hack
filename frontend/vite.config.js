import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // "generateSW" — Workbox generates the SW at build time.
      strategies: "generateSW",
      registerType: "autoUpdate",

      workbox: {
        // Include WASM binaries and JSON shards so TF.js model files are
        // precached alongside the app shell. The wildcard covers:
        //   *.js, *.css, *.html       — app shell
        //   *.wasm                     — TensorFlow WASM backend
        //   *.bin                      — TF.js model weight shards
        //   *.json                     — web_model/model.json + manifest
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,wasm,bin,json}"],

        // Serve index.html from cache on any navigation request (SPA fallback).
        navigateFallback: "index.html",

        // Don't fall back to index.html for API or AI inference routes.
        navigateFallbackDenylist: [/^\/api\//, /^\/diagnose\//],

        runtimeCaching: [
          // 1. API calls — NetworkFirst with 4-second timeout
          {
            urlPattern: /^\/api\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 4,
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // 2. TF.js model shards — CacheFirst, dedicated cache
          //    Covers /web_model/model.json and /web_model/*.bin
          {
            urlPattern: /^\/web_model\//,
            handler: "CacheFirst",
            options: {
              cacheName: "tfjs-model-cache",
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                maxEntries: 50,
              },
            },
          },

          // 3. CDN assets — CacheFirst for TF.js runtime + MobileNet weights
          //    Covers https://cdn.jsdelivr.net/* (all paths)
          {
            urlPattern: ({ url }) => url.hostname === "cdn.jsdelivr.net",
            handler: "CacheFirst",
            options: {
              cacheName: "tfjs-cdn-cache",
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
                maxEntries: 100,
              },
            },
          },
        ],
      },

      // Web App Manifest — required for PWA installability
      manifest: {
        name: "AgriShield",
        short_name: "AgriShield",
        description: "Mobile-first agricultural platform for rural farmers",
        theme_color: "#1a3a2a",
        background_color: "#0f2419",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],

  server: {
    host: true, // This makes it accessible on the network
    port: 5173, // Explicitly set the port
    hmr: { port: 5173 }, // Ensure HMR uses the same port
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://127.0.0.1:5000",
        ws: true,
      },
      "/diagnose": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          tfjs: ["@tensorflow/tfjs"],
        },
      },
    },
  },
});
