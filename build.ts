import tailwind from "bun-plugin-tailwind";
import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateAutoRegistry } from "./src/lib/toolRegistry";

const outdir = path.join(process.cwd(), "dist");
const scannedTools = generateAutoRegistry(path.join(process.cwd(), "src", "tools"));
await rm(outdir, { recursive: true, force: true });

const entrypoints = [...new Bun.Glob("src/**/*.html").scanSync()];

const result = await Bun.build({
  entrypoints,
  outdir,
  plugins: [tailwind],
  minify: true,
  target: "browser",
  sourcemap: "linked",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

for (const output of result.outputs) {
  console.log(` ${path.relative(process.cwd(), output.path)}  ${(output.size / 1024).toFixed(1)} KB`);
}

const staticAssets = [
  ["src/brand/favicon.svg", "favicon.svg"],
  ["src/brand/favicon.ico", "favicon.ico"],
  ["src/brand/favicon-192.png", "favicon-192.png"],
  ["src/brand/favicon-512.png", "favicon-512.png"],
  ["src/brand/apple-touch-icon.png", "apple-touch-icon.png"],
  ["src/brand/og-image.png", "og-image.png"],
  ["src/site.webmanifest", "site.webmanifest"],
  ["src/service-worker.js", "service-worker.js"],
] as const;

await mkdir(outdir, { recursive: true });
for (const [from, to] of staticAssets) {
  await copyFile(path.join(process.cwd(), from), path.join(outdir, to));
  console.log(` ${path.join("dist", to)}  static`);
}

const scanApiDir = path.join(outdir, "api", "tools");
await mkdir(scanApiDir, { recursive: true });
await writeFile(path.join(scanApiDir, "scan.json"), JSON.stringify(scannedTools, null, 2), "utf8");
console.log(" dist/api/tools/scan.json  static api");
