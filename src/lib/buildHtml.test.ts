import { describe, expect, test } from "bun:test";
import { normalizeSpaIndexHtml } from "./buildHtml";

describe("build html normalization", () => {
  test("rewrites generated root assets to root-relative URLs for deep link refreshes", () => {
    const html = '<link rel="stylesheet" href="./chunk.css"><script type="module" src="./chunk.js"></script>';

    expect(normalizeSpaIndexHtml(html)).toBe(
      '<link rel="stylesheet" href="/chunk.css"><script type="module" src="/chunk.js"></script>',
    );
  });

  test("rewrites nested Bun output assets to root-relative URLs", () => {
    const html = '<link rel="icon" href="../favicon.svg"><script type="module" src="../chunk.js"></script>';

    expect(normalizeSpaIndexHtml(html)).toBe(
      '<link rel="icon" href="/favicon.svg"><script type="module" src="/chunk.js"></script>',
    );
  });
});
