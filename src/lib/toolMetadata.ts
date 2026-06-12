import type { ToolCategory, ToolType } from "../tools/tools.index";

interface MetadataInput {
  id: string;
  type: ToolType;
  source?: string;
}

const ACRONYMS = new Set(["api", "css", "csv", "html", "http", "jwt", "json", "md", "qr", "sql", "svg", "url", "uuid"]);

const CATEGORY_RULES: Array<{ category: ToolCategory; words: string[] }> = [
  { category: "Design", words: ["color", "gradient", "palette", "design", "css", "oklch", "theme"] },
  { category: "Text", words: ["word", "text", "markdown", "md", "note", "diff", "textarea", "editor"] },
  { category: "Developer", words: ["json", "base64", "regex", "sql", "api", "http", "url", "uuid", "jwt", "decode", "encode"] },
  { category: "Math", words: ["math", "calc", "convert", "unit"] },
  { category: "Fun", words: ["game", "fun", "random", "dice", "meme"] },
];

const TAG_ALIASES: Record<string, string> = {
  calculator: "calc",
  kalender: "calendar",
  stopwatch: "timer",
  textarea: "text",
  toolbox: "tools",
};

const IMPORTANT_TAGS = new Set([
  "api",
  "base64",
  "calendar",
  "clock",
  "color",
  "css",
  "decode",
  "encode",
  "gradient",
  "html",
  "http",
  "jwt",
  "kalender",
  "json",
  "markdown",
  "qr",
  "react",
  "regex",
  "sql",
  "stopwatch",
  "text",
  "timer",
  "url",
  "uuid",
]);

const STOP_TAGS = new Set([
  "a",
  "an",
  "and",
  "are",
  "dan",
  "di",
  "for",
  "in",
  "is",
  "the",
  "to",
  "via",
  "yang",
]);

export function resolveToolIndexFile(type: ToolType, fileNames: string[]) {
  if (type === "html") return fileNames.includes("index.html") ? "index.html" : null;
  if (fileNames.includes("index.tsx")) return "index.tsx";
  if (fileNames.includes("index.jsx")) return "index.jsx";
  return null;
}

export function inferToolMetadata({ id, type, source = "" }: MetadataInput) {
  const words = wordsFromId(id);
  const htmlTitle = cleanTitle(extractHtml(source, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const metaDescription = extractHtml(
    source,
    /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
  );
  const heading = cleanTitle(extractHtml(source, /<h1[^>]*>([\s\S]*?)<\/h1>/i));
  const reactHeading = cleanTitle(extractReactHeading(source));
  const name = normalizeName(htmlTitle || heading || reactHeading || titleFromWords(words));
  const category = inferCategory([...words, ...wordsFromId(`${name} ${metaDescription}`)]);
  const tags = inferTags(type, words, category, `${name} ${metaDescription}`);

  return {
    name,
    description: sanitizeDescription(metaDescription) || fallbackDescription(type, category, words),
    category,
    tags,
  };
}

function extractHtml(source: string, pattern: RegExp) {
  return decodeEntities(pattern.exec(source)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "");
}

function extractReactHeading(source: string) {
  return /<h1[^>]*>([^<{]+)<\/h1>/i.exec(source)?.[1]?.trim() ?? "";
}

function cleanTitle(value: string) {
  return value
    .split(/\s+[|—-]\s+/)[0]
    .replace(/\btoolsx\b/gi, "")
    .replace(/\btoolbox\b/i, "Toolbox")
    .trim();
}

function sanitizeDescription(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function wordsFromId(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function titleFromWords(words: string[]) {
  return words.map(formatWord).join(" ");
}

function normalizeName(name: string) {
  return wordsFromId(name).map(formatWord).join(" ");
}

function formatWord(word: string) {
  if (ACRONYMS.has(word.toLowerCase())) return word.toUpperCase();
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function inferCategory(words: string[]): ToolCategory {
  const haystack = new Set(words.map((word) => word.toLowerCase()));
  for (const rule of CATEGORY_RULES) {
    if (rule.words.some((word) => haystack.has(word))) return rule.category;
  }
  return "Utility";
}

function inferTags(type: ToolType, words: string[], category: ToolCategory, context: string) {
  const contextWords = wordsFromId(context);
  const importantContext = contextWords.filter((word) => IMPORTANT_TAGS.has(word));
  const ordered = [type, ...words, ...importantContext, ...contextWords, category.toLowerCase()].map(
    (tag) => TAG_ALIASES[tag] ?? tag,
  );
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const tag of ordered) {
    if (STOP_TAGS.has(tag)) continue;
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    tags.push(tag);
    if (tags.length >= 5) break;
  }

  return tags;
}

function fallbackDescription(type: ToolType, category: ToolCategory, words: string[]) {
  const specificWords = words.filter((word) => !["tool", "tools"].includes(word));
  const label = specificWords.length > 0 ? specificWords.join(" ") : "utility";
  const domain = category === "Utility" ? "utility" : category.toLowerCase();
  return `Auto-detected ${type === "react" ? "React" : "HTML"} ${domain} tool for ${label}.`;
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
