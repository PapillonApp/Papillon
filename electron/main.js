const { app, BrowserWindow, session, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const http = require("node:http");

// A Google Geolocation API key, baked in at build time by
// .github/workflows/build-electron.yml from the GOOGLE_GEOLOCATION_API_KEY
// repo secret. Without it, Chromium's geolocation backend has no provider to
// ask and every position request fails — see the README for how to get one.
// This file is generated on build and is gitignored: never commit a real key.
let googleApiKey = "";
try {
  ({ googleApiKey } = require("./real-keys.json"));
} catch {
  // No key available (local dev without one). Geolocation permission still
  // works below; actual position lookups will fail until a key is provided.
}
if (googleApiKey) {
  process.env.GOOGLE_API_KEY = googleApiKey;
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".wasm": "application/wasm",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
};

// Expo's static export uses absolute paths ("/_expo/static/...css"), which
// only resolve correctly against a real HTTP origin, not file://. So Scola
// serves its own bundle from a tiny local server instead of loading files
// directly, with a fallback to index.html for any route it doesn't recognize
// on disk, so Expo Router's client-side navigation can take over.
function resolveDistDir() {
  const candidates = [
    path.join(__dirname, "dist"), // packaged build — see electron-builder.yml "files"
    path.join(__dirname, "..", "dist"), // local dev — repo-root dist/, built by `expo export`
  ];
  const found = candidates.find((dir) => fs.existsSync(path.join(dir, "index.html")));
  if (!found) {
    throw new Error(
      "dist/index.html introuvable. Lance d'abord l'export web : " +
        "PAPILLON_TARGET=electron npx expo export --platform web"
    );
  }
  return found;
}

function createStaticServer(rootDir) {
  return http.createServer((req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
      let filePath = path.join(rootDir, safePath);

      if (!filePath.startsWith(rootDir)) {
        res.writeHead(403).end("Forbidden");
        return;
      }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }
      if (!fs.existsSync(filePath)) {
        filePath = path.join(rootDir, "index.html"); // SPA fallback for client-side routes
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    } catch {
      res.writeHead(500).end("Internal Server Error");
    }
  });
}

let mainWindow = null;

function createWindow(startUrl) {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 860,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: "#050814",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL(startUrl);

  // Papillon opens some links (site de l'ENT, mentions légales, etc.) with
  // target="_blank" — send those to the user's real browser rather than a
  // bare, unmanaged Electron window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Papillon asks for location while locating a school during onboarding.
    // Grant that, deny every other permission by default.
    session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
      callback(permission === "geolocation");
    });
    session.defaultSession.setPermissionCheckHandler(
      (_wc, permission) => permission === "geolocation"
    );

    const server = createStaticServer(resolveDistDir());
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      createWindow(`http://127.0.0.1:${port}/`);
    });

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        const { port } = server.address();
        createWindow(`http://127.0.0.1:${port}/`);
      }
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
