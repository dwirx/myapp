import { useState, useRef, useEffect } from "react";

function MarkdownPreview() {
  const [md, setMd] = useState(`# Hello, Markdown

Write **bold**, *italic*, or \`inline code\`.

## Lists

- Item one
- Item two
  - Nested item

## Code blocks

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`;
\`\`\`

## Links & Quotes

> "The quick brown fox jumps over the lazy dog."

[Visit toolsx](https://toolsx.dev)
`);
  const previewRef = useRef<HTMLDivElement>(null);

  // Very minimal markdown parser (no external deps)
  const parse = (text: string): string => {
    const lines = text.split("\n");
    let html = "";
    let inCode = false;
    let codeLang = "";
    let codeLines: string[] = [];
    let inList = false;

    const flush = () => {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
    };

    for (const raw of lines) {
      if (raw.startsWith("```")) {
        if (!inCode) {
          inCode = true;
          codeLang = raw.slice(3).trim();
          codeLines = [];
          flush();
        } else {
          inCode = false;
          html += `<pre><code class="lang-${codeLang}">${escape(codeLines.join("\n"))}</code></pre>`;
          codeLines = [];
        }
        continue;
      }
      if (inCode) {
        codeLines.push(raw);
        continue;
      }

      // headings
      const h = raw.match(/^(#{1,6})\s(.+)/);
      if (h) {
        flush();
        html += `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`;
        continue;
      }
      // blockquote
      if (raw.startsWith("> ")) {
        flush();
        html += `<blockquote>${inline(raw.slice(2))}</blockquote>`;
        continue;
      }
      // list item
      if (/^\s*[-*]\s/.test(raw)) {
        if (!inList) { html += "<ul>"; inList = true; }
        html += `<li>${inline(raw.replace(/^\s*[-*]\s/, ""))}</li>`;
        continue;
      }
      // horizontal rule
      if (/^---+$/.test(raw.trim())) {
        flush();
        html += "<hr/>";
        continue;
      }
      // blank line
      if (raw.trim() === "") {
        flush();
        html += "<br/>";
        continue;
      }
      flush();
      html += `<p>${inline(raw)}</p>`;
    }
    flush();
    return html;
  };

  const inline = (s: string) =>
    s
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');

  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.innerHTML = parse(md);
    }
  }, [md]);

  return (
    <div className="md-shell">
      <div className="md-pane">
        <div className="pane-label">Markdown</div>
        <textarea
          value={md}
          onChange={(e) => setMd(e.target.value)}
          className="md-editor"
          spellCheck={false}
        />
      </div>
      <div className="md-pane">
        <div className="pane-label">Preview</div>
        <div ref={previewRef} className="md-preview" />
      </div>

      <style>{`
        .md-shell {
          font-family: 'Inter', system-ui, sans-serif;
          background: oklch(0.10 0.000 0);
          color: oklch(0.92 0.005 145);
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background-color: oklch(0.20 0.005 145);
        }
        @media (max-width: 600px) { .md-shell { grid-template-columns: 1fr; } }
        .md-pane {
          background: oklch(0.10 0.000 0);
          display: flex;
          flex-direction: column;
          padding: 20px;
          gap: 10px;
        }
        .pane-label {
          font-size: 0.68rem;
          color: oklch(0.56 0.008 145);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-family: 'JetBrains Mono', monospace;
        }
        .md-editor {
          flex: 1;
          background: oklch(0.13 0.005 145);
          border: 1px solid oklch(0.20 0.005 145);
          border-radius: 8px;
          color: oklch(0.92 0.005 145);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          line-height: 1.7;
          padding: 16px;
          resize: none;
          outline: none;
          min-height: calc(100vh - 80px);
        }
        .md-editor:focus { border-color: oklch(0.65 0.15 145); }
        .md-preview {
          flex: 1;
          line-height: 1.7;
          font-size: 0.95rem;
          min-height: calc(100vh - 80px);
          overflow: auto;
        }
        .md-preview h1 { font-size: 1.6rem; font-weight: 700; color: oklch(0.92 0.005 145); margin: 0 0 12px; letter-spacing: -0.02em; }
        .md-preview h2 { font-size: 1.2rem; font-weight: 600; color: oklch(0.80 0.008 145); margin: 20px 0 8px; }
        .md-preview h3 { font-size: 1rem; font-weight: 600; color: oklch(0.72 0.008 145); margin: 16px 0 6px; }
        .md-preview p { color: oklch(0.82 0.006 145); margin: 0 0 10px; }
        .md-preview code { background: oklch(0.18 0.008 145); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.85em; color: oklch(0.72 0.18 55); }
        .md-preview pre { background: oklch(0.14 0.005 145); border: 1px solid oklch(0.20 0.005 145); border-radius: 8px; padding: 16px; overflow: auto; margin: 12px 0; }
        .md-preview pre code { background: none; padding: 0; color: oklch(0.92 0.005 145); }
        .md-preview blockquote { border-left: 3px solid oklch(0.65 0.15 145); margin: 12px 0; padding: 8px 16px; color: oklch(0.65 0.008 145); }
        .md-preview ul { padding-left: 20px; margin: 8px 0; }
        .md-preview li { color: oklch(0.82 0.006 145); margin: 4px 0; }
        .md-preview a { color: oklch(0.65 0.15 145); }
        .md-preview hr { border: none; border-top: 1px solid oklch(0.22 0.005 145); margin: 16px 0; }
        .md-preview strong { color: oklch(0.92 0.005 145); font-weight: 700; }
      `}</style>
    </div>
  );
}

export default MarkdownPreview;
