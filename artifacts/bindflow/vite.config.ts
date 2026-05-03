import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Puerto por defecto para el entorno de Replit
const port = Number(process.env.PORT) || 5173;

export default defineConfig({
  // Mantenemos la base en la raíz
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    // Plugins específicos de Replit (solo en desarrollo)
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      // Configuración de alias para carpetas de componentes y assets
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(
        import.meta.dirname,
        "..",
        "..",
        "attached_assets",
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  // La raíz del proyecto es la carpeta actual (artifacts/bindflow)
  root: path.resolve(import.meta.dirname),
  build: {
    // Carpeta de salida que Cloudflare debe leer
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // "main" genera el index.html de la App de React
        main: path.resolve(import.meta.dirname, "index.html"),
        // "home" genera el landing.html de la Landing Page[cite: 1]
        home: path.resolve(import.meta.dirname, "landing.html"),
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
});
