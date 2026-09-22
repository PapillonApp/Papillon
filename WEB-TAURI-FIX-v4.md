# Scola / Papillon — Web/Tauri fix v4

Corrections included:

- Tauri HTTP plugin (`@tauri-apps/plugin-http`) for school API requests, avoiding browser CORS in the desktop WebView.
- Tauri HTTP capability for HTTP/HTTPS school endpoints.
- PRONOTE custom fetcher routed through the Tauri Rust HTTP client.
- EcoleDirecte internal `fetch()` calls routed through the same Tauri client.
- Web Reanimated custom entering/exiting builders disabled; native iOS/Android animations are unchanged.
- Web layout animation helper disabled to avoid Reanimated Web layout warnings.
- Web FakeSplash no longer uses a custom Reanimated exiting worklet.
- Fixed invalid Typography `variant="body"` usages that could cause `Cannot read properties of undefined (reading 'fontFamily')`.
- Added font-family fallback for invalid persisted personalization values.
- Added `check:web-compat` CI guard.

The direct PRONOTE desktop login flow remains subject to the existing Web/Tauri `browser.web.tsx` limitation (the native React Native WebView flow is not used on Web). Existing PRONOTE token refreshes use the new Tauri HTTP path.
