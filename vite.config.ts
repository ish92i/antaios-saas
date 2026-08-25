import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { partytownVite } from "@builder.io/partytown/utils";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { compression } from "vite-plugin-compression2";
import path from "path";

export default defineConfig({
  build: {
    sourcemap: "hidden",
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["@tanstack/react-router", "@tanstack/react-query"],
          "vendor-motion": ["motion"],
          "vendor-icons": ["lucide-react"],
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-tooltip",
          ],
          "vendor-convex": ["convex"],
          "vendor-clerk": ["@clerk/clerk-react"],
          "vendor-analytics": ["posthog-js"],
          "vendor-sentry": ["@sentry/react"],
          "vendor-i18n": ["i18next", "react-i18next", "i18next-browser-languagedetector"],
          "vendor-phone": ["react-phone-number-input"],
        },
      },
    },
  },
  plugins: [
    TanStackRouterVite({
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    viteReact(),
    compression(),
    partytownVite({
      dest: path.join(__dirname, "dist", "~partytown"),
    }),
    ...(process.env.SENTRY_AUTH_TOKEN
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            telemetry: false,
          }),
        ]
      : []),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "~": __dirname,
      "@": path.resolve(__dirname, "./src"),
      "@cvx": path.resolve(__dirname, "./convex"),
    },
  },
});
