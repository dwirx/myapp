export interface CommandItem {
  id: string;
  label: string;
  section: string;
  detail?: string;
  keywords?: string[];
  run: () => void | Promise<void>;
}

export function filterCommandItems(items: CommandItem[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;

  return items.filter((item) => {
    const haystack = [item.label, item.section, item.detail, ...(item.keywords ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return normalized.split(/\s+/).every((part) => haystack.includes(part));
  });
}
