export function getServiceWorkerUrl(baseHref: string) {
  return new URL("/service-worker.js", baseHref).toString();
}

export function canRegisterServiceWorker(protocol: string, hostname: string, supported: boolean) {
  return supported && (protocol === "https:" || hostname === "localhost" || hostname === "127.0.0.1");
}

export function registerServiceWorker() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  if (!canRegisterServiceWorker(window.location.protocol, window.location.hostname, "serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    void navigator.serviceWorker.register(getServiceWorkerUrl(window.location.href)).catch((error) => {
      console.warn("[Toolsx] Service worker registration failed:", error);
    });
  });
}
