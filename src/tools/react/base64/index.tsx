import { useState, useCallback } from "react";

function Base64Codec() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const run = useCallback(() => {
    setError("");
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch {
      setError(mode === "encode" ? "Encoding failed." : "Invalid Base64 input.");
      setOutput("");
    }
  }, [input, mode]);

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swap = () => {
    setInput(output);
    setOutput("");
    setMode((m) => (m === "encode" ? "decode" : "encode"));
  };

  return (
    <div className="b64-shell">
      <div className="b64-header">
        <div className="b64-mode-toggle">
          <button
            className={`mode-btn ${mode === "encode" ? "active" : ""}`}
            onClick={() => setMode("encode")}
          >
            Encode
          </button>
          <button
            className={`mode-btn ${mode === "decode" ? "active" : ""}`}
            onClick={() => setMode("decode")}
          >
            Decode
          </button>
        </div>
        <div className="b64-actions">
          <button onClick={run} className="btn-run">
            {mode === "encode" ? "→ Encode" : "← Decode"}
          </button>
          <button onClick={swap} className="btn-swap" title="Swap input/output">⇅</button>
        </div>
      </div>

      {error && <div className="b64-error">{error}</div>}

      <div className="b64-grid">
        <label className="b64-pane">
          <span className="pane-label">
            {mode === "encode" ? "Plain text" : "Base64"}
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Enter text to encode…" : "Enter Base64 to decode…"}
            className="b64-area"
            spellCheck={false}
          />
        </label>
        <div className="b64-pane">
          <div className="pane-label">
            {mode === "encode" ? "Base64" : "Plain text"}
            <button className="copy-btn" onClick={copy} disabled={!output}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <pre className="b64-output">{output}</pre>
        </div>
      </div>

      <style>{`
        .b64-shell {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          background: oklch(0.10 0.000 0);
          color: oklch(0.92 0.005 145);
          min-height: 100vh;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .b64-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .b64-mode-toggle {
          display: flex;
          background: oklch(0.14 0.005 145);
          border: 1px solid oklch(0.22 0.005 145);
          border-radius: 8px;
          overflow: hidden;
        }
        .mode-btn {
          padding: 8px 20px;
          background: none;
          border: none;
          color: oklch(0.56 0.008 145);
          font-family: inherit;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.15s;
        }
        .mode-btn.active {
          background: oklch(0.65 0.15 145);
          color: oklch(0.10 0.000 0);
          font-weight: 600;
        }
        .b64-actions { display: flex; gap: 8px; }
        .btn-run {
          background: oklch(0.65 0.15 145);
          color: oklch(0.10 0.000 0);
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-family: inherit;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-run:hover { background: oklch(0.70 0.16 145); }
        .btn-swap {
          background: oklch(0.18 0.005 145);
          border: 1px solid oklch(0.25 0.005 145);
          border-radius: 8px;
          color: oklch(0.92 0.005 145);
          padding: 8px 12px;
          font-size: 1rem;
          cursor: pointer;
          font-family: inherit;
        }
        .btn-swap:hover { background: oklch(0.22 0.005 145); }
        .b64-error {
          background: oklch(0.18 0.07 25);
          border: 1px solid oklch(0.38 0.14 25);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.8rem;
          color: oklch(0.78 0.10 25);
        }
        .b64-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          flex: 1;
        }
        @media (max-width: 600px) { .b64-grid { grid-template-columns: 1fr; } }
        .b64-pane {
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
        .copy-btn:disabled { color: oklch(0.38 0.006 145); cursor: default; }
        .b64-area, .b64-output {
          background: oklch(0.14 0.005 145);
          border: 1px solid oklch(0.20 0.005 145);
          border-radius: 8px;
          color: oklch(0.92 0.005 145);
          font-family: inherit;
          font-size: 0.82rem;
          line-height: 1.6;
          padding: 14px;
          min-height: 280px;
          flex: 1;
          resize: none;
          outline: none;
        }
        .b64-area:focus { border-color: oklch(0.65 0.15 145); }
        .b64-output {
          overflow: auto;
          white-space: pre-wrap;
          word-break: break-all;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default Base64Codec;
