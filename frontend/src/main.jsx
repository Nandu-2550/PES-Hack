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
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('[AgriHub] SW registered, scope:', reg.scope);
      setInterval(() => reg.update(), 60000);
    } catch (err) {
      console.error('[AgriHub] SW registration failed:', err);
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
