import { describe, expect, test } from "bun:test";
import { buildGalleryShareUrl, buildToolShareData, buildToolUrl, sharePayload } from "./share";
import type { EnrichedTool } from "../tools/auto-registry";

const tool: EnrichedTool = {
  id: "json-formatter",
  name: "JSON Formatter",
  description: "Format JSON quickly.",
  type: "react",
  path: "react/json-formatter",
  category: "Developer",
  tags: ["json"],
};

describe("share helpers", () => {
  test("builds stable absolute tool URLs", () => {
    expect(buildToolUrl(tool, "https://tools.example/base?x=1")).toBe("https://tools.example/tool/json-formatter");
  });

  test("builds share data for a tool", () => {
    expect(buildToolShareData(tool, "https://tools.example/")).toEqual({
      title: "JSON Formatter · Toolsx",
      text: "Format JSON quickly.",
      url: "https://tools.example/tool/json-formatter",
    });
  });

  test("builds shareable gallery URLs with encoded filters", () => {
    expect(
      buildGalleryShareUrl(
        {
          search: "json",
          activeType: "react",
          sortBy: "newest",
          activeCategory: "__pinned__",
        },
        "https://tools.example/",
      ),
    ).toBe("https://tools.example/?q=json&type=react&view=pinned");
  });

  test("falls back to legacy copy when Clipboard API fails", async () => {
    const result = await sharePayload(
      { title: "Toolsx", text: "View", url: "https://tools.example/" },
      {},
      { writeText: async () => { throw new Error("denied"); } },
      (text) => text === "https://tools.example/",
    );

    expect(result).toBe("copied");
  });
});
