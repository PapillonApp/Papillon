const { contextBridge } = require("electron");

// Minimal, safe bridge — contextIsolation stays on and nodeIntegration stays
// off in the renderer (Papillon renders HTML it doesn't fully control, e.g.
// messages/news from school portals, so the renderer is kept sandboxed).
contextBridge.exposeInMainWorld("papillonDesktop", {
  isDesktop: true,
  platform: process.platform,
});
