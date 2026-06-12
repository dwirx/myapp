import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Command, Hexagon, Moon, Search, Share2, Sparkles, Sun, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CommandPalette } from "../components/CommandPalette";
import { ToolCard } from "../components/ToolCard";
import { useAutoTools } from "../hooks/useAutoTools";
import { useTheme } from "../hooks/useTheme";
import { useToolPreferences } from "../hooks/useToolPreferences";
import type { CommandItem } from "../lib/commandPalette";
import { buildGalleryShareUrl, buildToolShareData, sharePayload, type SharePayload } from "../lib/share";
import { filterAndSortTools, type ToolSort, type ToolTypeFilter } from "../lib/toolFilters";
import { encodeToolFiltersToSearch, parseToolFiltersFromSearch } from "../lib/urlFilters";

function legacyCopyText(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "0 auto auto -9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

export function HomePage() {
  const { allTools, scanning, newCount, error } = useAutoTools();
  const { theme, toggleTheme } = useTheme();
  const toolPreferences = useToolPreferences();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilters = useMemo(() => parseToolFiltersFromSearch(searchParams.toString()), []);
  const [search, setSearch] = useState(initialFilters.search);
  const [activeCategory, setActiveCategory] = useState(initialFilters.activeCategory);
  const [activeType, setActiveType] = useState<ToolTypeFilter>(initialFilters.activeType);
  const [sortBy, setSortBy] = useState<ToolSort>(initialFilters.sortBy);
  const [commandOpen, setCommandOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const shareStatusTimer = useRef<number | null>(null);

  const currentFilters = useMemo(
    () => ({ search, activeCategory, activeType, sortBy }),
    [search, activeCategory, activeType, sortBy],
  );

  useEffect(() => {
    const next = parseToolFiltersFromSearch(searchParams.toString());
    setSearch(next.search);
    setActiveCategory(next.activeCategory);
    setActiveType(next.activeType);
    setSortBy(next.sortBy);
  }, [searchParams]);

  useEffect(() => {
    const nextQuery = encodeToolFiltersToSearch(currentFilters);
    if (nextQuery === searchParams.toString()) return;
    setSearchParams(nextQuery ? new URLSearchParams(nextQuery) : {}, { replace: true });
  }, [currentFilters, searchParams, setSearchParams]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const allCategories = useMemo(() => {
    const categories = Array.from(new Set(allTools.map((tool) => tool.category)));
    return ["All", ...categories];
  }, [allTools]);

  const visibleTools = useMemo(
    () =>
      filterAndSortTools(allTools, {
        search,
        activeCategory,
        activeType,
        sortBy,
        bookmarkedIds: toolPreferences.bookmarkedIds,
        pinnedIds: toolPreferences.pinnedIds,
      }),
    [allTools, search, activeCategory, activeType, sortBy, toolPreferences.bookmarkedIds, toolPreferences.pinnedIds],
  );

  const bookmarkCount = toolPreferences.bookmarkedIds.filter((id) => allTools.some((tool) => tool.id === id)).length;
  const pinCount = toolPreferences.pinnedIds.filter((id) => allTools.some((tool) => tool.id === id)).length;
  const hasActiveFilters = search.length > 0 || activeCategory !== "All" || activeType !== "all";
  const categoryLabel =
    activeCategory !== "All" &&
    activeCategory !== "__new__" &&
    activeCategory !== "__bookmarked__" &&
    activeCategory !== "__pinned__"
      ? ` in ${activeCategory}`
      : "";
  const resultLabel = `${visibleTools.length} tool${visibleTools.length === 1 ? "" : "s"}${
    scanning ? " (scanning for more)" : ""
  }${categoryLabel}${activeCategory === "__new__" ? " recently detected" : ""}${
    activeCategory === "__bookmarked__" ? " bookmarked" : ""
  }${activeCategory === "__pinned__" ? " pinned" : ""}${
    pinCount > 0 && activeCategory === "All" ? `, ${pinCount} pinned first` : ""
  }${search ? ` matching "${search}"` : ""}`;

  function resetFilters() {
    setSearch("");
    setActiveCategory("All");
    setActiveType("all");
    setSortBy("newest");
  }

  const runShare = useCallback(async (payload: SharePayload) => {
    if (shareStatusTimer.current) {
      window.clearTimeout(shareStatusTimer.current);
      shareStatusTimer.current = null;
    }

    try {
      const result = await sharePayload(payload, navigator, navigator.clipboard ?? {}, legacyCopyText);
      setShareStatus(result === "shared" ? "Shared" : "Link copied");
    } catch {
      setShareStatus("Share unavailable");
    }

    shareStatusTimer.current = window.setTimeout(() => {
      setShareStatus("");
      shareStatusTimer.current = null;
    }, 2200);
  }, []);

  const shareGallery = useCallback(() => {
    const url = buildGalleryShareUrl(currentFilters, window.location.href);
    void runShare({
      title: "Toolsx",
      text: "Open this Toolsx view.",
      url,
    });
  }, [currentFilters, runShare]);

  const shareTool = useCallback(
    (id: string) => {
      const tool = allTools.find((candidate) => candidate.id === id);
      if (!tool) return;
      void runShare(buildToolShareData(tool, window.location.href));
    },
    [allTools, runShare],
  );

  const commandItems = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      {
        id: "action-share-view",
        label: "Share current view",
        section: "Actions",
        detail: "Copy or share this filtered gallery URL",
        keywords: ["copy", "url", "link"],
        run: shareGallery,
      },
      {
        id: "action-toggle-theme",
        label: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
        section: "Actions",
        keywords: ["theme", "light", "dark"],
        run: toggleTheme,
      },
      {
        id: "view-pinned",
        label: "Show pinned tools",
        section: "Views",
        detail: `${pinCount} pinned`,
        keywords: ["pin", "favorite"],
        run: () => setActiveCategory("__pinned__"),
      },
      {
        id: "view-bookmarks",
        label: "Show bookmarks",
        section: "Views",
        detail: `${bookmarkCount} bookmarked`,
        keywords: ["saved", "favorite"],
        run: () => setActiveCategory("__bookmarked__"),
      },
      {
        id: "view-clear",
        label: "Clear filters",
        section: "Views",
        keywords: ["reset", "all"],
        run: resetFilters,
      },
    ];

    for (const tool of allTools) {
      const isBookmarked = toolPreferences.isBookmarked(tool.id);
      const isPinned = toolPreferences.isPinned(tool.id);
      items.push(
        {
          id: `open-${tool.id}`,
          label: `Open ${tool.name}`,
          section: "Tools",
          detail: tool.description || `${tool.type.toUpperCase()} · ${tool.category}`,
          keywords: [tool.id, tool.category, tool.type, ...(tool.tags ?? [])],
          run: () => navigate(`/tool/${encodeURIComponent(tool.id)}`),
        },
        {
          id: `share-${tool.id}`,
          label: `Share ${tool.name}`,
          section: "Share",
          detail: "Copy or share tool URL",
          keywords: [tool.id, "copy", "url", ...(tool.tags ?? [])],
          run: () => shareTool(tool.id),
        },
        {
          id: `bookmark-${tool.id}`,
          label: `${isBookmarked ? "Remove bookmark" : "Bookmark"} ${tool.name}`,
          section: "Bookmarks",
          keywords: [tool.id, "saved", ...(tool.tags ?? [])],
          run: () => toolPreferences.toggleBookmark(tool.id),
        },
        {
          id: `pin-${tool.id}`,
          label: `${isPinned ? "Unpin" : "Pin"} ${tool.name}`,
          section: "Pinned",
          keywords: [tool.id, "favorite", ...(tool.tags ?? [])],
          run: () => toolPreferences.togglePin(tool.id),
        },
      );
    }

    return items;
  }, [
    allTools,
    bookmarkCount,
    navigate,
    pinCount,
    shareGallery,
    shareTool,
    theme,
    toggleTheme,
    toolPreferences,
  ]);

  return (
    <div className="home-shell">
      <header className="home-header">
        <div className="home-logo-row">
          <div className="logo-section">
            <div className="home-logo" aria-label="Toolsx">
              <Hexagon className="logo-mark" aria-hidden="true" />
              <span className="logo-text">Toolsx</span>
            </div>

            {scanning ? (
              <span className="scan-badge scanning" aria-live="polite">
                <span className="scan-dot" /> Scanning
              </span>
            ) : newCount > 0 ? (
              <button
                type="button"
                className="scan-badge has-new"
                onClick={() => setActiveCategory(activeCategory === "__new__" ? "All" : "__new__")}
                aria-pressed={activeCategory === "__new__"}
              >
                <Sparkles size={13} aria-hidden="true" />
                {newCount} new
              </button>
            ) : null}
          </div>

          <div className="home-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setCommandOpen(true)}
              aria-label="Open command palette"
              title="Open command palette"
            >
              <Command size={17} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={shareGallery}
              aria-label="Share current view"
              title="Share current view"
            >
              <Share2 size={17} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
            </button>
          </div>
        </div>
        <p className="home-tagline">Your personal tool gallery. Drop a file, ship a tool.</p>
      </header>

      <section className="toolbar" aria-label="Tool filters">
        <div className="search-wrap">
          <Search className="search-icon" size={17} aria-hidden="true" />
          <input
            id="search-tools"
            type="search"
            placeholder="Search tools"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="search-input"
            autoComplete="off"
          />
          {search && (
            <button type="button" className="search-clear" onClick={() => setSearch("")} aria-label="Clear search">
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="toolbar-filters">
          <div className="type-filters" aria-label="Tool type">
            {(["all", "react", "html"] as const).map((type) => (
              <button
                type="button"
                key={type}
                className={`type-filter-btn ${activeType === type ? "active" : ""}`}
                onClick={() => setActiveType(type)}
                aria-pressed={activeType === type}
              >
                {type === "all" ? "All" : type === "react" ? "React" : "HTML"}
              </button>
            ))}
          </div>

          <label className="sort-wrap">
            <span className="sort-label">Sort</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as ToolSort)}
              className="sort-select"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </label>

          <div className="filter-chips" aria-label="Tool categories">
            <button
              type="button"
              className={`filter-chip filter-chip-pin ${activeCategory === "__pinned__" ? "active" : ""}`}
              onClick={() => setActiveCategory(activeCategory === "__pinned__" ? "All" : "__pinned__")}
              aria-pressed={activeCategory === "__pinned__"}
            >
              Pinned {pinCount}
            </button>
            <button
              type="button"
              className={`filter-chip filter-chip-bookmark ${activeCategory === "__bookmarked__" ? "active" : ""}`}
              onClick={() => setActiveCategory(activeCategory === "__bookmarked__" ? "All" : "__bookmarked__")}
              aria-pressed={activeCategory === "__bookmarked__"}
            >
              Bookmarks {bookmarkCount}
            </button>
            {allCategories.map((category) => (
              <button
                type="button"
                key={category}
                className={`filter-chip ${activeCategory === category ? "active" : ""}`}
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
            {newCount > 0 && (
              <button
                type="button"
                className={`filter-chip filter-chip-new ${activeCategory === "__new__" ? "active" : ""}`}
                onClick={() => setActiveCategory(activeCategory === "__new__" ? "All" : "__new__")}
                aria-pressed={activeCategory === "__new__"}
              >
                New
              </button>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div className="scan-error" role="status">
          <AlertTriangle size={15} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="results-meta">
        <span className="results-count">{resultLabel}</span>
        {shareStatus && (
          <span className="share-status" role="status">
            {shareStatus}
          </span>
        )}
      </div>

      {visibleTools.length > 0 ? (
        <div className="tools-grid">
          {visibleTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              bookmarked={toolPreferences.isBookmarked(tool.id)}
              pinned={toolPreferences.isPinned(tool.id)}
              onToggleBookmark={toolPreferences.toggleBookmark}
              onTogglePin={toolPreferences.togglePin}
              onShareTool={shareTool}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">No matches</div>
          <div className="empty-title">Nothing fits the current filters</div>
          <div className="empty-hint">
            Try a broader search, clear filters, or drop a file into{" "}
            <code className="inline-code">src/tools/html/</code> or{" "}
            <code className="inline-code">src/tools/react/</code>.
          </div>
          {hasActiveFilters && (
            <button type="button" className="empty-action" onClick={resetFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}
      <CommandPalette open={commandOpen} items={commandItems} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
