import { serve } from "bun";
import { join } from "path";
import index from "./index.html";
import { generateAutoRegistry } from "./lib/toolRegistry";

const TOOLS_DIR = join(import.meta.dir, "tools");
const ROOT_STATIC_ASSETS: Record<string, { path: string; type: string }> = {
  "/favicon.svg": { path: join(import.meta.dir, "brand", "favicon.svg"), type: "image/svg+xml; charset=utf-8" },
  "/favicon.ico": { path: join(import.meta.dir, "brand", "favicon.ico"), type: "image/x-icon" },
  "/favicon-192.png": { path: join(import.meta.dir, "brand", "favicon-192.png"), type: "image/png" },
  "/favicon-512.png": { path: join(import.meta.dir, "brand", "favicon-512.png"), type: "image/png" },
  "/apple-touch-icon.png": { path: join(import.meta.dir, "brand", "apple-touch-icon.png"), type: "image/png" },
  "/og-image.png": { path: join(import.meta.dir, "brand", "og-image.png"), type: "image/png" },
  "/site.webmanifest": { path: join(import.meta.dir, "site.webmanifest"), type: "application/manifest+json; charset=utf-8" },
  "/service-worker.js": { path: join(import.meta.dir, "service-worker.js"), type: "text/javascript; charset=utf-8" },
};

// Jalankan saat server start
generateAutoRegistry(TOOLS_DIR);

const server = serve({
  routes: {
    ...Object.fromEntries(
      Object.entries(ROOT_STATIC_ASSETS).map(([route, asset]) => [
        route,
        async () => {
          const file = Bun.file(asset.path);
          if (!(await file.exists())) return new Response("Not found", { status: 404 });
          return new Response(file, {
            headers: {
              "Content-Type": asset.type,
              "Cache-Control": route === "/service-worker.js" ? "no-cache" : "public, max-age=86400",
              ...(route === "/service-worker.js" ? { "Service-Worker-Allowed": "/" } : {}),
            },
          });
        },
      ]),
    ),

    // ── API: scan tools directory ─────────────────────────────────────────
    "/api/tools/scan": {
      GET() {
        const toolsList = generateAutoRegistry(TOOLS_DIR);
        return Response.json(toolsList, {
          headers: { "Cache-Control": "no-store" },
        });
      },
    },

    // ── Serve HTML tool files (folder-based): /src/tools/html/<name>/index.html ──
    "/src/tools/html/:tool/index.html": async (req) => {
      const tool = (req.params as Record<string, string>).tool;
      const filePath = join(TOOLS_DIR, "html", tool, "index.html");
      const file = Bun.file(filePath);
      if (!(await file.exists())) {
        return new Response("Tool not found", { status: 404 });
      }
      return new Response(file, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    },

    // ── Serve HTML tool single files: /src/tools/html/<name>.html ──────────
    "/src/tools/html/:file": async (req) => {
      const file = (req.params as Record<string, string>).file;
      if (!file.endsWith(".html")) {
        return new Response("Not found", { status: 404 });
      }
      const filePath = join(TOOLS_DIR, "html", file);
      const bunFile = Bun.file(filePath);
      if (!(await bunFile.exists())) {
        return new Response("Tool not found", { status: 404 });
      }
      return new Response(bunFile, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    },

    // ── SPA fallback ────────────────────────────────────────────────────────
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Toolsx running at ${server.url}`);
