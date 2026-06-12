import { describe, expect, test } from "bun:test";
import { inferToolMetadata, resolveToolIndexFile } from "./toolMetadata";

describe("tool metadata inference", () => {
  test("uses html title and meta description for auto-detected html tools", () => {
    const metadata = inferToolMetadata({
      id: "toolsbox",
      type: "html",
      source: `
        <title>Toolbox — Jam Dunia, Stopwatch, Timer, Kalender, Kalkulator</title>
        <meta name="description" content="Jam dunia multi-zona, stopwatch, timer, kalender, dan kalkulator." />
      `,
    });

    expect(metadata.name).toBe("Toolbox");
    expect(metadata.description).toBe("Jam dunia multi-zona, stopwatch, timer, kalender, dan kalkulator.");
    expect(metadata.category).toBe("Utility");
    expect(metadata.tags).toContain("timer");
    expect(metadata.tags).toContain("calendar");
  });

  test("creates readable names and developer metadata from arbitrary filenames", () => {
    const metadata = inferToolMetadata({
      id: "jwt_decode_tool",
      type: "react",
      source: "export default function JwtDecodeTool() { return <h1>JWT Decode Tool</h1>; }",
    });

    expect(metadata.name).toBe("JWT Decode Tool");
    expect(metadata.description).toBe("Auto-detected React developer tool for jwt decode.");
    expect(metadata.category).toBe("Developer");
    expect(metadata.tags).toEqual(["react", "jwt", "decode", "tool", "developer"]);
  });

  test("keeps editor and markdown tools in the text category even when descriptions mention URLs", () => {
    const metadata = inferToolMetadata({
      id: "textarea",
      type: "html",
      source: `
        <title>Textarea</title>
        <meta name="description" content="A minimalist Markdown editor. Notes are stored locally and shareable via the URL." />
      `,
    });

    expect(metadata.category).toBe("Text");
    expect(metadata.tags).toContain("markdown");
    expect(metadata.tags).not.toContain("a");
  });

  test("prefers jsx index files when a react folder uses index.jsx", () => {
    expect(resolveToolIndexFile("react", ["readme.md", "index.jsx"])).toBe("index.jsx");
    expect(resolveToolIndexFile("react", ["index.tsx", "index.jsx"])).toBe("index.tsx");
    expect(resolveToolIndexFile("html", ["main.html", "index.html"])).toBe("index.html");
  });
});
