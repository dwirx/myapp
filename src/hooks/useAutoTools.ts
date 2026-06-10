import { useEffect, useState } from "react";
import { tools as initialTools } from "../tools/auto-registry";
import type { EnrichedTool } from "../tools/auto-registry";

export function useAutoTools() {
  const [allTools, setAllTools] = useState<EnrichedTool[]>(initialTools);
  const [scanning, setScanning] = useState(true);
  const [newCount, setNewCount] = useState(
    initialTools.filter((t) => t.autoDetected).length
  );

  useEffect(() => {
    let cancelled = false;

    async function scan() {
      setScanning(true);
      try {
        const res = await fetch("/api/tools/scan");
        if (!res.ok) throw new Error("scan failed");
        const entries: EnrichedTool[] = await res.json();

        if (cancelled) return;

        setNewCount(entries.filter((t) => t.autoDetected).length);
        setAllTools(entries);
      } catch (e) {
        console.warn("[Toolsx] Auto-scan failed:", e);
      } finally {
        if (!cancelled) setScanning(false);
      }
    }

    scan();
    return () => { cancelled = true; };
  }, []);

  return { allTools, scanning, newCount };
}
