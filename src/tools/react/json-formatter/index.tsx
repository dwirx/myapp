import { useState, useCallback } from "react";

function JSONFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState(2);

  const format = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, indent]);

  const minify = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input]);

  const copy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const clear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <div className="tool-shell">
      <div className="tool-header">
        <h1 className="tool-title">JSON Formatter</h1>
        <div className="tool-controls">
          <label className="ctrl-label">
            Indent
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="ctrl-select"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </label>
          <button onClick={format} className="btn btn-primary">Format</button>
          <button onClick={minify} className="btn btn-ghost">Minify</button>
          <button onClick={clear} className="btn btn-ghost">Clear</button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-dot" />
          {error}
        </div>
      )}

      <div className="editor-grid">
        <div className="editor-pane">
          <div className="pane-label">Input</div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{ "paste": "your json here" }'
            className="code-area"
            spellCheck={false}
          />
        </div>
        <div className="editor-pane">
          <div className="pane-label">
            Output
            <button onClick={copy} className="copy-btn" disabled={!output}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="code-output">{output}</pre>
        </div>
      </div>

      <style>{`
        .tool-shell {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          background: oklch(0.10 0.000 0);
          color: oklch(0.92 0.005 145);
          min-height: 100vh;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .tool-header {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .tool-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: oklch(0.65 0.15 145);
          margin: 0;
          letter-spacing: -0.02em;
        }
        .tool-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .ctrl-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: oklch(0.56 0.008 145);
        }
        .ctrl-select {
          background: oklch(0.14 0.005 145);
          border: 1px solid oklch(0.25 0.005 145);
          border-radius: 6px;
          color: oklch(0.92 0.005 145);
          padding: 4px 8px;
          font-size: 0.75rem;
          font-family: inherit;
        }
        .btn {
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          font-family: inherit;
          transition: all 0.15s;
        }
        .btn-primary {
          background: oklch(0.65 0.15 145);
          color: oklch(0.10 0.000 0);
        }
        .btn-primary:hover { background: oklch(0.70 0.16 145); }
        .btn-ghost {
          background: oklch(0.18 0.005 145);
          color: oklch(0.92 0.005 145);
          border: 1px solid oklch(0.25 0.005 145);
        }
        .btn-ghost:hover { background: oklch(0.22 0.005 145); }
        .error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          background: oklch(0.20 0.08 25);
          border: 1px solid oklch(0.40 0.15 25);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.8rem;
          color: oklch(0.80 0.10 25);
        }
        .error-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: oklch(0.65 0.20 25);
          flex-shrink: 0;
        }
        .editor-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          flex: 1;
        }
        @media (max-width: 640px) {
          .editor-grid { grid-template-columns: 1fr; }
        }
        .editor-pane {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pane-label {
          font-size: 0.7rem;
          color: oklch(0.56 0.008 145);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .copy-btn {
          background: none;
          border: none;
          color: oklch(0.65 0.15 145);
          font-size: 0.7rem;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
        }
        .copy-btn:disabled { color: oklch(0.40 0.008 145); cursor: default; }
        .code-area, .code-output {
          background: oklch(0.14 0.005 145);
          border: 1px solid oklch(0.20 0.005 145);
          border-radius: 8px;
          color: oklch(0.92 0.005 145);
          font-family: inherit;
          font-size: 0.82rem;
          line-height: 1.6;
          padding: 14px;
          flex: 1;
          min-height: 320px;
          resize: none;
          outline: none;
        }
        .code-area:focus { border-color: oklch(0.65 0.15 145); }
        .code-output {
          overflow: auto;
          white-space: pre;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default JSONFormatter;
