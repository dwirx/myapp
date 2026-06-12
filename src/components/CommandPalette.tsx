import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Command, Search, X } from "lucide-react";
import { filterCommandItems, type CommandItem } from "../lib/commandPalette";

interface CommandPaletteProps {
  open: boolean;
  items: CommandItem[];
  onClose: () => void;
}

export function CommandPalette({ open, items, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const filteredItems = useMemo(() => filterCommandItems(items, query), [items, query]);
  const visibleItems = filteredItems.slice(0, 12);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function runItem(item: CommandItem) {
    await item.run();
    onClose();
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, Math.max(visibleItems.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = visibleItems[activeIndex];
      if (item) void runItem(item);
    }
  }

  return (
    <div className="command-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="command-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="command-search">
          <Command size={16} aria-hidden="true" />
          <Search size={16} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search tools and actions"
            aria-label="Search commands"
          />
          <button type="button" className="command-close" onClick={onClose} aria-label="Close command palette">
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="command-list" role="listbox" aria-label="Commands">
          {visibleItems.length > 0 ? (
            visibleItems.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className={`command-item ${index === activeIndex ? "active" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => void runItem(item)}
                role="option"
                aria-selected={index === activeIndex}
              >
                <span className="command-item-main">
                  <span className="command-item-label">{item.label}</span>
                  {item.detail && <span className="command-item-detail">{item.detail}</span>}
                </span>
                <span className="command-item-section">{item.section}</span>
              </button>
            ))
          ) : (
            <div className="command-empty">No command matches</div>
          )}
        </div>
      </div>
    </div>
  );
}
