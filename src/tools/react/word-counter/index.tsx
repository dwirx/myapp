import { useState } from "react";

function WordCounter() {
  const [text, setText] = useState("");

  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const sentences = text.trim() === "" ? 0 : text.split(/[.!?]+/).filter(Boolean).length;
  const paragraphs = text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const stats = [
    { label: "Words", value: words },
    { label: "Characters", value: chars },
    { label: "No spaces", value: charsNoSpace },
    { label: "Sentences", value: sentences },
    { label: "Paragraphs", value: paragraphs },
    { label: "Read time", value: `${readingTime} min` },
  ];

  return (
    <div className="wc-shell">
      <div className="wc-stats">
        {stats.map((s) => (
          <div key={s.label} className="wc-stat">
            <span className="wc-num">{s.value}</span>
            <span className="wc-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing or paste your text here…"
        className="wc-area"
        autoFocus
      />

      <style>{`
        .wc-shell {
          font-family: 'Inter', system-ui, sans-serif;
          background: oklch(0.10 0.000 0);
          color: oklch(0.92 0.005 145);
          min-height: 100vh;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .wc-stats {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1px;
          background: oklch(0.20 0.005 145);
          border-radius: 12px;
          overflow: hidden;
        }
        @media (max-width: 640px) {
          .wc-stats { grid-template-columns: repeat(3, 1fr); }
        }
        .wc-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 12px;
          background: oklch(0.13 0.005 145);
          gap: 4px;
        }
        .wc-num {
          font-size: 1.5rem;
          font-weight: 700;
          color: oklch(0.65 0.15 145);
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .wc-lbl {
          font-size: 0.68rem;
          color: oklch(0.56 0.008 145);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .wc-area {
          flex: 1;
          min-height: 400px;
          background: oklch(0.14 0.005 145);
          border: 1px solid oklch(0.20 0.005 145);
          border-radius: 12px;
          color: oklch(0.92 0.005 145);
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 1rem;
          line-height: 1.7;
          padding: 20px;
          resize: vertical;
          outline: none;
          transition: border-color 0.15s;
        }
        .wc-area:focus { border-color: oklch(0.65 0.15 145); }
        .wc-area::placeholder { color: oklch(0.38 0.006 145); }
      `}</style>
    </div>
  );
}

export default WordCounter;
