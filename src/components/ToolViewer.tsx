import { lazy, Suspense, useRef } from "react";
import type { Tool } from "../tools/tools.index";
import { reactComponents } from "../tools/auto-registry";

interface ToolViewerProps {
  tool: Tool;
  fullscreen?: boolean;
}

function ReactToolViewer({ path }: { path: string }) {
  const Component = reactComponents[path];
  if (!Component) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)", fontFamily: "JetBrains Mono, monospace", fontSize: "0.85rem" }}>
        No component registered for <code style={{ color: "var(--accent)", marginLeft: 8 }}>{path}</code>
      </div>
    );
  }
  return (
    <Suspense fallback={<LoadingState />}>
      <Component />
    </Suspense>
  );
}


// Nav bar ~53px + desc bar ~45px = ~98px total chrome above the viewer
const TOOLPAGE_CHROME_HEIGHT = 98;

function HtmlToolViewer({ tool, fullscreen }: { tool: Tool; fullscreen: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Resolve the correct URL:
  // - Folder tool  → /src/tools/html/<name>/index.html  (field: path = "html/<name>")
  // - Single file  → /src/tools/html/<name>.html         (field: filePath = "html/<name>.html")
  //
  // If the tool has a filePath that ends in .html but NOT index.html, it's a single file.
  const fp = (tool as any).filePath as string | undefined;
  const isSingleFile = fp && fp.endsWith(".html") && !fp.endsWith("index.html");
  const src = isSingleFile
    ? `/src/tools/${fp}`                          // e.g. /src/tools/html/javasandi.html
    : `/src/tools/${tool.path}/index.html`;        // e.g. /src/tools/html/gradient-maker/index.html

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={tool.name}
      sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
      style={{
        width: "100%",
        flex: 1,
        minHeight: fullscreen ? "100vh" : "0",
        border: "none",
        display: "block",
        background: "oklch(0.10 0 0)",
      }}
    />
  );
}

function LoadingState() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      minHeight: 200,
      gap: 10,
      color: "var(--muted)",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "0.82rem",
    }}>
      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite" }} />
      Loading tool…
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export function ToolViewer({ tool, fullscreen = false }: ToolViewerProps) {
  return (
    <div style={{
      width: "100%",
      flex: 1,
      // For React tools overflow auto lets content scroll;
      // for HTML tools the iframe itself manages scroll
      overflow: tool.type === "react" ? "auto" : "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {tool.type === "react" ? (
        <ReactToolViewer path={tool.path} />
      ) : (
        <HtmlToolViewer tool={tool} fullscreen={fullscreen} />
      )}
    </div>
  );
}
