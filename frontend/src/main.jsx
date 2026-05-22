import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";

// ---------------------------------------------------------------------------
// Service Worker registration
//
// Step 1: Unregister any stale/broken service workers (e.g. the old Workbox
//         CDN-import version that caused "ServiceWorker script evaluation failed").
//         This runs once, cleans up, then re-registers the new vanilla SW.
// ---------------------------------------------------------------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      // Unregister every existing registration so the old broken SW is evicted
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        // Only unregister if it's pointing at a cached/old version that may be broken
        // We unregister all and re-register fresh on every dev reload.
        // In production VitePWA handles this via autoUpdate.
        if (reg.active?.scriptURL?.includes("sw.js")) {
          await reg.unregister();
        }
      }
    } catch {
      // Unregister failure is non-fatal — continue to registration
    }

    try {
      const reg = await navigator.serviceWorker.register("/sw.js", {
        // updateViaCache: 'none' tells the browser to always fetch a fresh copy
        // of sw.js from the network rather than using the HTTP cache.
        // This guarantees the new vanilla-JS SW replaces the old Workbox one.
        updateViaCache: "none",
      });

      console.log("✅ SW registered:", reg.scope);

      // Poll for SW updates every 60 seconds
      setInterval(() => reg.update(), 60_000);

      // Tell a waiting SW to activate immediately (skipWaiting)
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        newWorker?.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    } catch (err) {
      console.error("❌ SW registration failed:", err);
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
