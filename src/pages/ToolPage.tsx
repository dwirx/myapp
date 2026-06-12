import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Command, ExternalLink, Maximize2, Moon, Share2, Sun, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CommandPalette } from "../components/CommandPalette";
import { ToolViewer } from "../components/ToolViewer";
import { useAutoTools } from "../hooks/useAutoTools";
import { useTheme } from "../hooks/useTheme";
import { useToolPreferences } from "../hooks/useToolPreferences";
import type { CommandItem } from "../lib/commandPalette";
import { buildToolShareData, sharePayload, type SharePayload } from "../lib/share";

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

export function ToolPage() {
  const { id } = useParams<{ id: string }>();
  const { allTools } = useAutoTools();
  const navigate = useNavigate();
  const [fullscreen, setFullscreen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const shareStatusTimer = useRef<number | null>(null);
  const { theme, toggleTheme } = useTheme();
  const toolPreferences = useToolPreferences();
  const tool = allTools.find((candidate) => candidate.id === id);

  useEffect(() => {
    if (commandOpen) return;
    if (!fullscreen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setFullscreen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [commandOpen, fullscreen]);

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

  const shareTool = useCallback(() => {
    if (!tool) return;
    void runShare(buildToolShareData(tool, window.location.href));
  }, [runShare, tool]);

  const commandItems = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      {
        id: "back-gallery",
        label: "Back to gallery",
        section: "Navigation",
        keywords: ["home", "tools"],
        run: () => navigate("/"),
      },
      {
        id: "toggle-theme",
        label: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
        section: "Actions",
        keywords: ["theme", "light", "dark"],
        run: toggleTheme,
      },
    ];

    if (tool) {
      const isBookmarked = toolPreferences.isBookmarked(tool.id);
      const isPinned = toolPreferences.isPinned(tool.id);
      items.push(
        {
          id: "share-current-tool",
          label: `Share ${tool.name}`,
          section: "Share",
          detail: "Copy or share tool URL",
          keywords: ["copy", "url", ...(tool.tags ?? [])],
          run: shareTool,
        },
        {
          id: "fullscreen-current-tool",
          label: "Open fullscreen",
          section: "Actions",
          keywords: ["focus", "viewer"],
          run: () => setFullscreen(true),
        },
        {
          id: "bookmark-current-tool",
          label: `${isBookmarked ? "Remove bookmark" : "Bookmark"} ${tool.name}`,
          section: "Bookmarks",
          keywords: ["saved", ...(tool.tags ?? [])],
          run: () => toolPreferences.toggleBookmark(tool.id),
        },
        {
          id: "pin-current-tool",
          label: `${isPinned ? "Unpin" : "Pin"} ${tool.name}`,
          section: "Pinned",
          keywords: ["favorite", ...(tool.tags ?? [])],
          run: () => toolPreferences.togglePin(tool.id),
        },
      );
    }

    for (const candidate of allTools) {
      if (candidate.id === tool?.id) continue;
      items.push({
        id: `open-${candidate.id}`,
        label: `Open ${candidate.name}`,
        section: "Tools",
        detail: candidate.description || `${candidate.type.toUpperCase()} · ${candidate.category}`,
        keywords: [candidate.id, candidate.category, candidate.type, ...(candidate.tags ?? [])],
        run: () => navigate(`/tool/${encodeURIComponent(candidate.id)}`),
      });
    }

    return items;
  }, [allTools, navigate, shareTool, theme, toggleTheme, tool, toolPreferences]);

  if (!tool) {
    return (
      <div className="tool-notfound">
        <div className="notfound-code">404</div>
        <div className="notfound-msg">Tool not found</div>
        <Link to="/" className="notfound-back">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to gallery
        </Link>
      </div>
    );
  }

  const htmlSingleFile = tool.filePath?.endsWith(".html") && !tool.filePath.endsWith("index.html");
  const newTabUrl =
    tool.type === "html"
      ? htmlSingleFile
        ? `/src/tools/${tool.filePath}`
        : `/src/tools/${tool.path}/index.html`
      : window.location.href;

  if (fullscreen) {
    return (
      <div className="fullscreen-shell">
        <button type="button" className="fullscreen-exit" onClick={() => setFullscreen(false)}>
          <X size={15} aria-hidden="true" />
          Exit fullscreen
        </button>
        <ToolViewer tool={tool} fullscreen />
      </div>
    );
  }

  return (
    <div className="toolpage-shell">
      <nav className="toolpage-nav" aria-label="Tool navigation">
        <div className="nav-left">
          <Link to="/" className="nav-back">
            <ArrowLeft size={15} aria-hidden="true" />
            <span className="nav-brand">Toolsx</span>
          </Link>
          <span className="nav-sep">/</span>
          <div className="nav-title-group">
            <span className="nav-tool-name">{tool.name}</span>
            {tool.description && (
              <span className="nav-tool-desc" title={tool.description}>
                {tool.description}
              </span>
            )}
          </div>
        </div>

        <div className="nav-right">
          {tool.tags && tool.tags.length > 0 && (
            <div className="nav-tags-inline">
              {tool.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="nav-tag-inline">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <span className="nav-badge" data-type={tool.type}>
            {tool.type === "react" ? "React" : "HTML"}
          </span>
          <span className="nav-badge nav-badge-category">{tool.category}</span>
          {shareStatus && (
            <span className="share-status share-status-nav" role="status">
              {shareStatus}
            </span>
          )}
          <button
            type="button"
            className="nav-btn nav-btn-icon"
            onClick={() => setCommandOpen(true)}
            title="Open command palette"
            aria-label="Open command palette"
          >
            <Command size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="nav-btn nav-btn-icon"
            onClick={shareTool}
            title="Share tool"
            aria-label="Share tool"
          >
            <Share2 size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="nav-btn"
            onClick={() => window.open(newTabUrl, "_blank", "noopener")}
            title="Open in new tab"
            aria-label="Open in new tab"
          >
            <ExternalLink size={14} aria-hidden="true" />
            <span className="nav-btn-text">New tab</span>
          </button>
          <button
            type="button"
            className="nav-btn nav-btn-primary"
            onClick={() => setFullscreen(true)}
            title="Open in fullscreen"
            aria-label="Open in fullscreen"
          >
            <Maximize2 size={14} aria-hidden="true" />
            <span className="nav-btn-text">Fullscreen</span>
          </button>
          <button
            type="button"
            className="nav-btn nav-btn-icon"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <div className="toolpage-viewer">
        <ToolViewer tool={tool} />
      </div>
      <CommandPalette open={commandOpen} items={commandItems} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
