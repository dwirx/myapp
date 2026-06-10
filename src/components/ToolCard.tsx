import { Link } from "react-router-dom";
import type { EnrichedTool } from "../hooks/useAutoTools";
import { isToolRecent } from "../hooks/useAutoTools";

const CATEGORY_COLORS: Record<string, string> = {
  Developer: "oklch(0.65 0.15 145)",
  Utility:   "oklch(0.72 0.18 55)",
  Design:    "oklch(0.65 0.15 220)",
  Text:      "oklch(0.65 0.14 290)",
  Math:      "oklch(0.65 0.15 30)",
  Fun:       "oklch(0.65 0.18 330)",
};

interface ToolCardProps {
  tool: EnrichedTool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const catColor = CATEGORY_COLORS[tool.category] ?? "oklch(0.65 0.12 200)";
  const catBg    = `oklch(from ${catColor} l c h / 0.12)`;
  const showNewBadge = tool.autoDetected && isToolRecent(tool.date);

  /** URL untuk open in new tab — HTML: langsung ke file, React: ke /tool/:id */
  const newTabUrl = tool.type === "html"
    ? `/src/tools/${tool.path}/index.html`
    : `/tool/${tool.id}`;

  function handleNewTab(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    window.open(newTabUrl, "_blank", "noopener");
  }

  return (
    <Link to={`/tool/${tool.id}`} className="tool-card" style={{ "--cat": catColor } as React.CSSProperties}>
      <div className="tool-card-inner">
        {/* Header badges */}
        <div className="tool-card-top">
          <span className="tool-type-badge" style={{ background: catBg, color: "var(--cat)" }}>
            {tool.type === "react" ? "TSX" : "HTML"}
          </span>
          <span className="tool-cat-badge" style={{ background: catBg, color: "var(--cat)" }}>
            {tool.category}
          </span>
          {showNewBadge && (
            <span className="tool-new-badge">NEW</span>
          )}
          {/* Open in new tab — top-right corner */}
          <button
            className="tool-newtab-btn"
            onClick={handleNewTab}
            title="Open in new tab"
            aria-label={`Open ${tool.name} in new tab`}
          >
            ↗
          </button>
        </div>

        {/* Body */}
        <div className="tool-card-body">
          <h2 className="tool-card-name">{tool.name}</h2>
          {tool.description && <p className="tool-card-desc">{tool.description}</p>}
        </div>

        {/* Footer */}
        <div className="tool-card-footer">
          <div className="tool-card-tags">
            {tool.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="tool-tag">#{tag}</span>
            ))}
          </div>
          <span className="tool-card-arrow">→</span>
        </div>
      </div>

      <style>{`
        .tool-card {
          display: block;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          position: relative;
          overflow: hidden;
          text-decoration: none;
        }
        .tool-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at top left, oklch(from var(--cat) l c h / 0.06), transparent 60%);
          opacity: 0;
          transition: opacity 0.25s;
          pointer-events: none;
        }
        .tool-card:hover {
          border-color: var(--cat);
          background: var(--surface-2);
          transform: translateY(-2px);
        }
        .tool-card:hover::before { opacity: 1; }

        .tool-card-inner {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          height: 100%;
        }

        .tool-card-top {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .tool-type-badge, .tool-cat-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          padding: 3px 8px;
          border-radius: 4px;
        }

        /* NEW badge — auto-detected tools */
        .tool-new-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: 4px;
          background: oklch(from var(--accent) l c h / 0.12);
          color: var(--accent);
          border: 1px solid oklch(from var(--accent) l c h / 0.35);
          letter-spacing: 0.08em;
          animation: pulse-new 2s ease-in-out infinite;
        }
        @keyframes pulse-new {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tool-new-badge { animation: none; }
        }

        /* Open in new tab button */
        .tool-newtab-btn {
          margin-left: auto;
          background: none;
          border: 1px solid transparent;
          border-radius: 4px;
          color: var(--muted);
          font-size: 0.85rem;
          padding: 2px 6px;
          cursor: pointer;
          line-height: 1;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .tool-newtab-btn:hover {
          background: var(--surface-2);
          border-color: var(--border-2);
          color: var(--ink);
        }
        .tool-card:hover .tool-newtab-btn { color: var(--ink-2); }

        .tool-card-body { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .tool-card-name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--ink);
          margin: 0;
          letter-spacing: -0.02em;
        }
        .tool-card-desc {
          font-size: 0.82rem;
          color: var(--muted);
          margin: 0;
          line-height: 1.55;
        }

        .tool-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tool-card-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .tool-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          color: var(--muted);
        }
        .tool-card-arrow {
          font-size: 0.9rem;
          color: var(--muted);
          transition: color 0.2s, transform 0.2s;
        }
        .tool-card:hover .tool-card-arrow {
          color: var(--cat);
          transform: translateX(3px);
        }

        @media (max-width: 640px) {
          .tool-card-inner {
            padding: 16px;
            gap: 12px;
          }
          .tool-card-name {
            font-size: 0.95rem;
          }
          .tool-card-desc {
            font-size: 0.78rem;
          }
        }
      `}</style>
    </Link>
  );
}
