// src/registerServiceWorker.ts
export function registerServiceWorker(
  onUpdate?: (registration: ServiceWorkerRegistration) => void
) {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        // When a new SW is waiting, call onUpdate so your UI can prompt user to refresh
        if (reg.waiting && onUpdate) onUpdate(reg);

        reg.addEventListener("updatefound", () => {
          const newSW = reg.installing;
          if (!newSW) return;
          newSW.addEventListener("statechange", () => {
            if (newSW.state === "installed") {
              if (navigator.serviceWorker.controller && onUpdate) {
                onUpdate(reg);
              }
            }
          });
        });
      } catch (err) {
        console.warn("SW registration failed:", err);
      }
    });
  }
}

export async function skipWaitingAndReload(reg: ServiceWorkerRegistration) {
  if (!reg || !reg.waiting) return;
  // Tell the waiting SW to skipWaiting, then reload to activate
  reg.waiting.postMessage({ type: "SKIP_WAITING" });
  // optional: listen for controllerchange to reload
  navigator.serviceWorker.addEventListener(
    "controllerchange",
    function handle() {
      navigator.serviceWorker.removeEventListener("controllerchange", handle);
      window.location.reload();
    }
  );
}
