import type { ToolSort, ToolTypeFilter } from "./toolFilters";

export interface ShareableToolFilters {
  search: string;
  activeCategory: string;
  activeType: ToolTypeFilter;
  sortBy: ToolSort;
}

const viewToCategory: Record<string, string> = {
  new: "__new__",
  bookmarks: "__bookmarked__",
  pinned: "__pinned__",
};

const categoryToView: Record<string, string> = {
  __new__: "new",
  __bookmarked__: "bookmarks",
  __pinned__: "pinned",
};

function isToolTypeFilter(value: string | null): value is ToolTypeFilter {
  return value === "all" || value === "react" || value === "html";
}

function isToolSort(value: string | null): value is ToolSort {
  return value === "newest" || value === "oldest" || value === "name-asc" || value === "name-desc";
}

export function parseToolFiltersFromSearch(search: string): ShareableToolFilters {
  const params = new URLSearchParams(search);
  const view = params.get("view");
  const category = params.get("category");

  return {
    search: params.get("q") ?? "",
    activeType: isToolTypeFilter(params.get("type")) ? params.get("type")! : "all",
    sortBy: isToolSort(params.get("sort")) ? params.get("sort")! : "newest",
    activeCategory: view && viewToCategory[view] ? viewToCategory[view] : category || "All",
  };
}

export function encodeToolFiltersToSearch(filters: ShareableToolFilters) {
  const params = new URLSearchParams();
  const search = filters.search.trim();

  if (search) params.set("q", search);
  if (filters.activeType !== "all") params.set("type", filters.activeType);
  if (filters.sortBy !== "newest") params.set("sort", filters.sortBy);

  const view = categoryToView[filters.activeCategory];
  if (view) {
    params.set("view", view);
  } else if (filters.activeCategory !== "All") {
    params.set("category", filters.activeCategory);
  }

  return params.toString();
}
