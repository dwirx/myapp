import { describe, expect, test } from "bun:test";
import { encodeToolFiltersToSearch, parseToolFiltersFromSearch } from "./urlFilters";

describe("tool filter URL state", () => {
  test("parses search, view, type, sort, and category from URL params", () => {
    expect(parseToolFiltersFromSearch("?q=json&type=react&sort=name-desc&view=pinned")).toEqual({
      search: "json",
      activeType: "react",
      sortBy: "name-desc",
      activeCategory: "__pinned__",
    });

    expect(parseToolFiltersFromSearch("?category=Developer&type=html&sort=oldest")).toEqual({
      search: "",
      activeType: "html",
      sortBy: "oldest",
      activeCategory: "Developer",
    });
  });

  test("ignores default values when encoding a shareable URL query", () => {
    expect(
      encodeToolFiltersToSearch({
        search: "",
        activeType: "all",
        sortBy: "newest",
        activeCategory: "All",
      }),
    ).toBe("");

    expect(
      encodeToolFiltersToSearch({
        search: "color picker",
        activeType: "html",
        sortBy: "name-asc",
        activeCategory: "__bookmarked__",
      }),
    ).toBe("q=color+picker&type=html&sort=name-asc&view=bookmarks");
  });
});
