import { serve } from "bun";
import { join } from "path";
import { readdirSync, statSync, writeFileSync } from "fs";
import index from "./index.html";
import { tools as registeredTools } from "./tools/tools.index";

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

/** Scan src/tools/html/ dan src/tools/react/ — return daftar semua tool yang ditemukan */
function scanTools() {
  const results: Array<{
    id: string;
    type: "html" | "react";
    path: string;
    /** File path relatif dari tools dir, untuk serving */
    filePath: string;
  }> = [];

  for (const type of ["html", "react"] as const) {
    const typeDir = join(TOOLS_DIR, type);
    let entries: string[];
    try {
      entries = readdirSync(typeDir);
    } catch {
      continue;
    }

    for (const entry of entries) {
      // Abaikan folder/file yang diawali _ (helper/shared)
      if (entry.startsWith("_")) continue;

      const fullPath = join(typeDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Folder — cari index file di dalamnya
        const ext = type === "html" ? "index.html" : "index.tsx";
        const indexPath = join(fullPath, ext);
        let hasIndex = false;
        try { statSync(indexPath); hasIndex = true; } catch {}

        // Juga coba index.jsx untuk react
        if (!hasIndex && type === "react") {
          try { statSync(join(fullPath, "index.jsx")); hasIndex = true; } catch {}
        }

        if (hasIndex) {
          const id = entry;
          results.push({
            id,
            type,
            path: `${type}/${id}`,
            filePath: `${type}/${id}/index.${type === "html" ? "html" : "tsx"}`,
          });
        }
      } else if (stat.isFile()) {
        // Single file
        if (type === "html" && entry.endsWith(".html")) {
          const id = entry.replace(/\.html$/, "");
          results.push({
            id,
            type: "html",
            path: `html/${id}`,
            filePath: `html/${entry}`,
          });
        } else if (type === "react" && (entry.endsWith(".tsx") || entry.endsWith(".jsx"))) {
          const id = entry.replace(/\.(tsx|jsx)$/, "");
          results.push({
            id,
            type: "react",
            path: `react/${id}`,
            filePath: `react/${entry}`,
          });
        }
      }
    }
  }

  return results;
}

/** Menghasilkan src/tools/auto-registry.tsx secara dinamis */
function generateAutoRegistry() {
  const scanned = scanTools();
  const registeredIds = new Set(registeredTools.map((t) => t.id));
  const allTools: any[] = [];

  function toTitle(id: string) {
    return id
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function inferCategory(id: string, type: "html" | "react") {
    const lower = id.toLowerCase();
    if (/color|gradient|palette|design|css/.test(lower)) return "Design";
    if (/json|base64|regex|sql|api|http|url|uuid/.test(lower)) return "Developer";
    if (/word|text|markdown|md|note|diff/.test(lower)) return "Text";
    if (/math|calc|convert|unit/.test(lower)) return "Math";
    if (/game|fun|random|dice|meme/.test(lower)) return "Fun";
    return "Utility";
  }

  const reactComponentsLines: string[] = [];

  // Add registered tools with date stats
  for (const t of registeredTools) {
    const match = scanned.find((s) => s.id === t.id && s.type === t.type);
    const fp = match ? match.filePath : (t.type === "html" ? `html/${t.id}/index.html` : `react/${t.id}/index.tsx`);
    let mtime = Date.now();
    try {
      mtime = statSync(join(TOOLS_DIR, fp)).mtimeMs;
    } catch {}

    allTools.push({
      ...t,
      filePath: fp,
      date: mtime
    });

    if (t.type === "react") {
      reactComponentsLines.push(`  "${t.path}": lazy(() => import("./${fp}")),`);
    }
  }

  // Add auto-detected React and HTML tools with date stats
  for (const entry of scanned) {
    if (registeredIds.has(entry.id)) continue;

    let mtime = Date.now();
    try {
      mtime = statSync(join(TOOLS_DIR, entry.filePath)).mtimeMs;
    } catch {}

    const inferred = {
      id: entry.id,
      name: toTitle(entry.id),
      description: "",
      type: entry.type,
      path: entry.path,
      category: inferCategory(entry.id, entry.type),
      tags: [entry.type, entry.id],
      autoDetected: true,
      filePath: entry.filePath,
      date: mtime,
    };
    allTools.push(inferred);

    if (entry.type === "react") {
      reactComponentsLines.push(`  "${entry.path}": lazy(() => import("./${entry.filePath}")),`);
    }
  }

  const content = `// =========================================================
// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Generated by the build/dev server (src/index.ts).
// =========================================================
import { lazy } from "react";
import type { Tool } from "./tools.index";

export interface EnrichedTool extends Tool {
  autoDetected?: boolean;
  filePath?: string;
}

export const tools: EnrichedTool[] = ${JSON.stringify(allTools, null, 2)};

export const reactComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
${reactComponentsLines.join("\n")}
};
`;

  const registryPath = join(TOOLS_DIR, "auto-registry.tsx");
  try {
    writeFileSync(registryPath, content, "utf8");
    console.log(`[Server] Dynamic auto-registry generated with ${allTools.length} tools.`);
  } catch (err) {
    console.error("[Server] Failed to write auto-registry:", err);
  }
  return allTools;
}

// Jalankan saat server start
generateAutoRegistry();

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
        const toolsList = generateAutoRegistry();
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
