import tailwind from "bun-plugin-tailwind";
import { copyFile, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
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

await normalizeBunHtmlOutput();

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

async function normalizeBunHtmlOutput() {
  const nestedIndex = path.join(outdir, "src", "index.html");
  const rootIndex = path.join(outdir, "index.html");

  try {
    const html = await readFile(nestedIndex, "utf8");
    await writeFile(rootIndex, html.replaceAll('href="../', 'href="./').replaceAll('src="../', 'src="./'), "utf8");
    console.log(" dist/index.html  normalized spa entry");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  try {
    await cp(path.join(outdir, "src", "tools"), path.join(outdir, "tools"), { recursive: true, force: true });
    console.log(" dist/tools/  normalized tool assets");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
