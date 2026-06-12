import { describe, expect, test } from "bun:test";
import { resolveToolDate } from "./toolRegistry";

describe("tool registry dates", () => {
  test("prefers the last git commit timestamp over filesystem mtime for newest sorting", () => {
    const result = resolveToolDate("/repo/src/tools", "html/new-tool.html", {
      readGitTimestamp: () => 1_781_290_920,
      readMtime: () => 123,
    });

    expect(result).toBe(1_781_290_920_000);
  });

  test("falls back to filesystem mtime when git history is unavailable", () => {
    const result = resolveToolDate("/repo/src/tools", "html/new-tool.html", {
      readGitTimestamp: () => null,
      readMtime: () => 456,
    });

    expect(result).toBe(456);
  });
});
