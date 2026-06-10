import { useState, useMemo } from "react";
import { categories } from "../tools/tools.index";
import { useAutoTools } from "../hooks/useAutoTools";
import { ToolCard } from "../components/ToolCard";
import { useTheme } from "../hooks/useTheme";

export function HomePage() {
  const { allTools, scanning, newCount } = useAutoTools();
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeType, setActiveType] = useState<"all" | "react" | "html">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name-asc" | "name-desc">("newest");

  // Hitung kategori dari semua tool (termasuk auto-detected)
  const allCategories = useMemo(() => {
    const cats = Array.from(new Set(allTools.map((t) => t.category)));
    return ["All", ...cats];
  }, [allTools]);

  const filtered = useMemo(() => {
    return allTools.filter((t) => {
      const matchSearch =
        search === "" ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      const matchCat = activeCategory === "All" || t.category === activeCategory;
      const matchType = activeType === "all" || t.type === activeType;
      return matchSearch && matchCat && matchType;
    });
  }, [allTools, search, activeCategory, activeType]);

  const sorted = useMemo(() => {
    const items = [...filtered];
    if (sortBy === "newest") {
      items.sort((a, b) => (b.date ?? 0) - (a.date ?? 0));
    } else if (sortBy === "oldest") {
      items.sort((a, b) => (a.date ?? 0) - (b.date ?? 0));
    } else if (sortBy === "name-asc") {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      items.sort((a, b) => b.name.localeCompare(a.name));
    }
    return items;
  }, [filtered, sortBy]);

  return (
    <div className="home-shell">
      {/* Header */}
      <header className="home-header">
        <div className="home-logo-row">
          <div className="logo-section">
            <div className="home-logo">
              <span className="logo-mark">⬡</span>
              <span className="logo-text">Toolsx</span>
            </div>

            {/* Scan status badge */}
            {scanning ? (
              <span className="scan-badge scanning">
                <span className="scan-dot" /> Scanning…
              </span>
            ) : newCount > 0 ? (
              <span className="scan-badge has-new">
                ✦ {newCount} new tool{newCount > 1 ? "s" : ""} detected
              </span>
            ) : null}
          </div>

          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
        <p className="home-tagline">
          Your personal tool gallery. Drop a file, ship a tool.
        </p>
      </header>

      {/* Toolbar: Search + Filter */}
      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            id="search-tools"
            type="search"
            placeholder="Search tools…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            autoComplete="off"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")} aria-label="Clear search">
              ×
            </button>
          )}
        </div>

        <div className="toolbar-filters">
          <div className="type-filters">
            {(["all", "react", "html"] as const).map((type) => (
              <button
                key={type}
                className={`type-filter-btn ${activeType === type ? "active" : ""}`}
                onClick={() => setActiveType(type)}
              >
                {type === "all" ? "All Types" : type === "react" ? "React" : "HTML"}
              </button>
            ))}
          </div>

          <div className="sort-wrap">
            <span className="sort-label">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="sort-select"
            >
              <option value="newest">Terbaru (Newest)</option>
              <option value="oldest">Terlama (Oldest)</option>
              <option value="name-asc">Nama (A-Z)</option>
              <option value="name-desc">Nama (Z-A)</option>
            </select>
          </div>

          <div className="filter-chips">
            {allCategories.map((cat) => (
              <button
                key={cat}
                className={`filter-chip ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
            {/* Filter hanya auto-detected */}
            {newCount > 0 && (
              <button
                className={`filter-chip filter-chip-new ${activeCategory === "__new__" ? "active" : ""}`}
                onClick={() => setActiveCategory(activeCategory === "__new__" ? "All" : "__new__")}
              >
                ✦ New
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results meta */}
      <div className="results-meta">
        <span className="results-count">
          {scanning
            ? `${sorted.length} tool${sorted.length !== 1 ? "s" : ""} (scanning for more…)`
            : `${sorted.length} tool${sorted.length !== 1 ? "s" : ""}` +
              (activeCategory !== "All" && activeCategory !== "__new__" ? ` in ${activeCategory}` : "") +
              (search ? ` matching "${search}"` : "")}
        </span>
      </div>

      {/* Tool grid */}
      {sorted.length > 0 ? (
        <div className="tools-grid">
          {sorted
            .filter((t) => activeCategory !== "__new__" || t.autoDetected)
            .map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">∅</div>
          <div className="empty-title">No tools found</div>
          <div className="empty-hint">
            Try a different search term, or drop a new file in{" "}
            <code className="inline-code">src/tools/html/</code> or{" "}
            <code className="inline-code">src/tools/react/</code>.
          </div>
        </div>
      )}

      <style>{`
        .home-shell {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 24px 80px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .home-header { display: flex; flex-direction: column; gap: 8px; }
        .home-logo-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .home-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-mark {
          font-size: 1.8rem;
          color: var(--primary);
          line-height: 1;
          filter: drop-shadow(0 0 12px oklch(0.65 0.15 145 / 0.5));
        }
        .logo-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.04em;
        }
        .home-tagline {
          font-size: 0.88rem;
          color: var(--muted);
          margin: 0;
        }

        /* Theme Toggle */
        .theme-toggle {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.1rem;
          transition: all 0.15s;
        }
        .theme-toggle:hover {
          border-color: var(--primary);
          background: var(--surface-2);
          transform: scale(1.05);
        }
        .theme-toggle:active {
          transform: scale(0.95);
        }

        /* Scan status badges */
        .scan-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .scan-badge.scanning {
          background: oklch(0.18 0.005 145);
          border: 1px solid var(--border);
          color: var(--muted);
        }
        .scan-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--muted);
          animation: blink 1s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .scan-badge.has-new {
          background: oklch(0.72 0.18 55 / 0.12);
          border: 1px solid oklch(0.72 0.18 55 / 0.35);
          color: oklch(0.72 0.18 55);
        }

        /* Toolbar */
        .toolbar { display: flex; flex-direction: column; gap: 14px; }
        .search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          font-size: 1.1rem;
          color: var(--muted);
          pointer-events: none;
          line-height: 1;
          transform: rotate(45deg) scaleX(-1);
        }
        .search-input {
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--ink);
          font-size: 0.9rem;
          padding: 11px 40px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .search-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px oklch(0.65 0.15 145 / 0.15);
        }
        .search-input::placeholder { color: var(--muted); }
        .search-input::-webkit-search-cancel-button { display: none; }
        .search-clear {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--muted);
          font-size: 1.2rem;
          line-height: 1;
          padding: 0;
          cursor: pointer;
        }
        .search-clear:hover { color: var(--ink); }

        /* Filters Layout */
        .toolbar-filters {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* Type filters (Segmented Control) */
        .type-filters {
          display: flex;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 3px;
          gap: 2px;
          flex-shrink: 0;
        }
        .type-filter-btn {
          background: none;
          border: none;
          color: var(--muted);
          font-size: 0.78rem;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: calc(var(--radius) - 2px);
          cursor: pointer;
          transition: all 0.15s;
        }
        .type-filter-btn:hover {
          color: var(--ink);
        }
        .type-filter-btn.active {
          background: var(--surface);
          color: var(--primary);
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        /* Sort dropdown */
        .sort-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 5px 12px;
          font-size: 0.78rem;
          color: var(--muted);
          flex-shrink: 0;
        }
        .sort-label {
          font-weight: 500;
        }
        .sort-select {
          background: none;
          border: none;
          color: var(--ink);
          font-weight: 600;
          outline: none;
          cursor: pointer;
          font-size: 0.78rem;
          padding: 0;
        }
        .sort-select option {
          background: var(--surface-2);
          color: var(--ink);
        }

        /* Filter chips */
        .filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
        .filter-chip {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 999px;
          color: var(--muted);
          font-size: 0.78rem;
          padding: 5px 14px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .filter-chip:hover { border-color: var(--primary); color: var(--ink); }
        .filter-chip.active {
          background: oklch(0.65 0.15 145 / 0.12);
          border-color: var(--primary);
          color: var(--primary);
          font-weight: 600;
        }
        .filter-chip-new {
          border-color: oklch(0.72 0.18 55 / 0.4);
          color: oklch(0.72 0.18 55);
          background: oklch(0.72 0.18 55 / 0.06);
        }
        .filter-chip-new:hover, .filter-chip-new.active {
          background: oklch(0.72 0.18 55 / 0.15);
          border-color: oklch(0.72 0.18 55);
          color: oklch(0.72 0.18 55);
        }

        /* Results */
        .results-meta { margin-top: -8px; }
        .results-count {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          color: var(--muted);
        }

        /* Grid */
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        /* Empty state */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 80px 20px;
          color: var(--muted);
        }
        .empty-icon { font-size: 3rem; line-height: 1; color: var(--border-2); }
        .empty-title { font-size: 1rem; font-weight: 600; color: var(--ink-2); }
        .empty-hint { font-size: 0.85rem; text-align: center; line-height: 1.6; }
        .inline-code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.82em;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 1px 5px;
          color: var(--primary);
        }

        /* ── Responsive & Mobile Adjustments ── */
        @media (max-width: 640px) {
          .home-shell {
            padding: 28px 16px 64px;
            gap: 20px;
          }
          .home-logo-row {
            gap: 10px;
          }
          .home-tagline {
            font-size: 0.82rem;
          }
          .toolbar {
            gap: 12px;
          }
          .toolbar-filters {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .type-filters {
            width: 100%;
            display: flex;
          }
          .type-filter-btn {
            flex: 1;
            text-align: center;
            padding: 8px 10px;
          }
          .sort-wrap {
            width: 100%;
            justify-content: space-between;
            padding: 8px 12px;
          }
          .filter-chips {
            display: flex;
            overflow-x: auto;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            padding: 4px 16px;
            margin: 0 -16px;
            gap: 6px;
            scrollbar-width: none;
          }
          .filter-chips::-webkit-scrollbar {
            display: none;
          }
          .filter-chip {
            flex-shrink: 0;
            padding: 6px 14px;
          }
          .tools-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}
