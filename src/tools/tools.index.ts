export type ToolType = "react" | "html";
export type ToolCategory = "Developer" | "Utility" | "Design" | "Text" | "Math" | "Fun";

export interface Tool {
  id: string;
  name: string;
  description: string;
  type: ToolType;
  path: string;
  category: ToolCategory;
  tags?: string[];
}

export const tools: Tool[] = [
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Paste raw JSON to format, validate, and explore it with syntax highlighting.",
    type: "react",
    path: "react/json-formatter",
    category: "Developer",
    tags: ["json", "format", "validate"],
  },
  {
    id: "word-counter",
    name: "Word Counter",
    description: "Counts words, characters, sentences, and reading time as you type.",
    type: "react",
    path: "react/word-counter",
    category: "Text",
    tags: ["text", "words", "reading"],
  },
  {
    id: "gradient-maker",
    name: "Gradient Maker",
    description: "Build CSS gradients visually and copy the ready-to-use code.",
    type: "html",
    path: "html/gradient-maker",
    category: "Design",
    tags: ["css", "gradient", "color"],
  },
  {
    id: "base64",
    name: "Base64 Codec",
    description: "Encode or decode Base64 strings instantly, with file support.",
    type: "react",
    path: "react/base64",
    category: "Developer",
    tags: ["encode", "decode", "base64"],
  },
  {
    id: "color-picker",
    name: "Color Picker",
    description: "Convert between HEX, RGB, HSL, and OKLCH color formats.",
    type: "html",
    path: "html/color-picker",
    category: "Design",
    tags: ["color", "hex", "oklch"],
  },
  {
    id: "markdown-preview",
    name: "Markdown Preview",
    description: "Write Markdown on the left, see live rendered HTML on the right.",
    type: "react",
    path: "react/markdown-preview",
    category: "Text",
    tags: ["markdown", "preview", "md"],
  },
];

export const categories = Array.from(new Set(tools.map((t) => t.category)));
