import type { EnrichedTool } from "../tools/auto-registry";
import type { ShareableToolFilters } from "./urlFilters";
import { encodeToolFiltersToSearch } from "./urlFilters";

export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

interface ShareNavigator {
  share?: (data: SharePayload) => Promise<void>;
}

interface ClipboardLike {
  writeText?: (text: string) => Promise<void>;
}

export type LegacyCopy = (text: string) => boolean;

export function buildToolUrl(tool: Pick<EnrichedTool, "id">, baseHref: string) {
  return new URL(`/tool/${encodeURIComponent(tool.id)}`, baseHref).toString();
}

export function buildToolShareData(tool: EnrichedTool, baseHref: string): SharePayload {
  return {
    title: `${tool.name} · Toolsx`,
    text: tool.description || `Open ${tool.name} in Toolsx.`,
    url: buildToolUrl(tool, baseHref),
  };
}

export function buildGalleryShareUrl(filters: ShareableToolFilters, baseHref: string) {
  const url = new URL("/", baseHref);
  const query = encodeToolFiltersToSearch(filters);
  url.search = query;
  return url.toString();
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Clipboard timed out.")), timeoutMs);
    }),
  ]);
}

export async function sharePayload(
  payload: SharePayload,
  navigatorLike: ShareNavigator,
  clipboard: ClipboardLike,
  legacyCopy?: LegacyCopy,
) {
  if (navigatorLike.share) {
    await navigatorLike.share(payload);
    return "shared" as const;
  }

  if (clipboard.writeText) {
    try {
      await withTimeout(clipboard.writeText(payload.url), 600);
      return "copied" as const;
    } catch {
      // Fall through to the synchronous copy path. Some automated or locked-down
      // browsers expose Clipboard API but deny writes even after a user gesture.
    }
  }

  if (legacyCopy?.(payload.url)) return "copied" as const;

  throw new Error("Clipboard is unavailable.");
}
