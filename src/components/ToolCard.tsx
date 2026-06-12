import type { CSSProperties, MouseEvent } from "react";
import { ArrowRight, Bookmark, ExternalLink, Pin, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { EnrichedTool } from "../hooks/useAutoTools";
import { isToolRecent } from "../hooks/useAutoTools";

const CATEGORY_COLORS: Record<string, string> = {
  Developer: "oklch(0.65 0.15 145)",
  Utility: "oklch(0.72 0.18 55)",
  Design: "oklch(0.65 0.15 220)",
  Text: "oklch(0.65 0.14 290)",
  Math: "oklch(0.65 0.15 30)",
  Fun: "oklch(0.65 0.18 330)",
};

interface ToolCardProps {
  tool: EnrichedTool;
  bookmarked?: boolean;
  pinned?: boolean;
  onToggleBookmark?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onShareTool?: (id: string) => void;
}

export function ToolCard({
  tool,
  bookmarked = false,
  pinned = false,
  onToggleBookmark,
  onTogglePin,
  onShareTool,
}: ToolCardProps) {
  const catColor = CATEGORY_COLORS[tool.category] ?? "oklch(0.65 0.12 200)";
  const catBg = `oklch(from ${catColor} l c h / 0.12)`;
  const showNewBadge = tool.autoDetected && isToolRecent(tool.date);
  const newTabUrl =
    tool.type === "html"
      ? tool.filePath?.endsWith(".html") && !tool.filePath.endsWith("index.html")
        ? `/src/tools/${tool.filePath}`
        : `/src/tools/${tool.path}/index.html`
      : `/tool/${tool.id}`;

  function handleNewTab(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    window.open(newTabUrl, "_blank", "noopener");
  }

  function handleBookmark(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onToggleBookmark?.(tool.id);
  }

  function handlePin(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onTogglePin?.(tool.id);
  }

  function handleShare(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onShareTool?.(tool.id);
  }

  return (
    <article
      className={`tool-card ${pinned ? "is-pinned" : ""} ${bookmarked ? "is-bookmarked" : ""}`}
      style={{ "--cat": catColor } as CSSProperties}
    >
      <div className="tool-card-inner">
        <div className="tool-card-top">
          <span className="tool-type-badge" style={{ background: catBg, color: "var(--cat)" }}>
            {tool.type === "react" ? "TSX" : "HTML"}
          </span>
          <span className="tool-cat-badge" style={{ background: catBg, color: "var(--cat)" }}>
            {tool.category}
          </span>
          {pinned && <span className="tool-pin-badge">PINNED</span>}
          {showNewBadge && <span className="tool-new-badge">NEW</span>}
          <div className="tool-card-actions">
            <button
              type="button"
              className={`tool-action-btn ${bookmarked ? "active" : ""}`}
              onClick={handleBookmark}
              title={bookmarked ? "Remove bookmark" : "Bookmark tool"}
              aria-label={bookmarked ? `Remove ${tool.name} bookmark` : `Bookmark ${tool.name}`}
              aria-pressed={bookmarked}
            >
              <Bookmark size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`tool-action-btn ${pinned ? "active pin-active" : ""}`}
              onClick={handlePin}
              title={pinned ? "Unpin tool" : "Pin tool"}
              aria-label={pinned ? `Unpin ${tool.name}` : `Pin ${tool.name}`}
              aria-pressed={pinned}
            >
              <Pin size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="tool-action-btn"
              onClick={handleShare}
              title="Share tool"
              aria-label={`Share ${tool.name}`}
            >
              <Share2 size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="tool-action-btn"
              onClick={handleNewTab}
              title="Open in new tab"
              aria-label={`Open ${tool.name} in new tab`}
            >
              <ExternalLink size={14} aria-hidden="true" />
            </button>
          </div>
        </div>

        <Link to={`/tool/${encodeURIComponent(tool.id)}`} className="tool-card-link">
          <div className="tool-card-body">
            <h2 className="tool-card-name">{tool.name}</h2>
            {tool.description ? (
              <p className="tool-card-desc">{tool.description}</p>
            ) : (
              <p className="tool-card-desc muted-desc">Auto-detected {tool.type.toUpperCase()} tool.</p>
            )}
          </div>

          <div className="tool-card-footer">
            <div className="tool-card-tags">
              {tool.tags?.slice(0, 3).map((tag) => (
                <span key={tag} className="tool-tag">
                  #{tag}
                </span>
              ))}
            </div>
            <span className="tool-card-arrow" aria-hidden="true">
              <ArrowRight size={15} />
            </span>
          </div>
        </Link>
      </div>
    </article>
  );
}
