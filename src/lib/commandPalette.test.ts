import { describe, expect, test } from "bun:test";
import { filterCommandItems, type CommandItem } from "./commandPalette";

const items: CommandItem[] = [
  { id: "open-json", label: "Open JSON Formatter", section: "Tools", keywords: ["json", "format"], run: () => {} },
  { id: "theme", label: "Toggle theme", section: "Actions", keywords: ["light", "dark"], run: () => {} },
  { id: "bookmarks", label: "Show bookmarks", section: "Views", keywords: ["saved"], run: () => {} },
];

describe("command palette", () => {
  test("returns all items for an empty query", () => {
    expect(filterCommandItems(items, "").map((item) => item.id)).toEqual(["open-json", "theme", "bookmarks"]);
  });

  test("matches labels and keywords case-insensitively", () => {
    expect(filterCommandItems(items, "DARK").map((item) => item.id)).toEqual(["theme"]);
    expect(filterCommandItems(items, "format").map((item) => item.id)).toEqual(["open-json"]);
  });
});
