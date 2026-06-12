import { describe, expect, test } from "bun:test";
import { canRegisterServiceWorker, getServiceWorkerUrl } from "./pwa";

describe("pwa helpers", () => {
  test("builds a root-scoped service worker URL", () => {
    expect(getServiceWorkerUrl("https://tools.example/tool/json")).toBe("https://tools.example/service-worker.js");
  });

  test("allows service worker registration on https and localhost", () => {
    expect(canRegisterServiceWorker("https:", "tools.example", true)).toBe(true);
    expect(canRegisterServiceWorker("http:", "localhost", true)).toBe(true);
    expect(canRegisterServiceWorker("http:", "tools.example", true)).toBe(false);
    expect(canRegisterServiceWorker("https:", "tools.example", false)).toBe(false);
  });
});
