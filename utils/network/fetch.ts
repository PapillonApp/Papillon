import { Platform } from "react-native";

type TauriFetch = typeof import("@tauri-apps/plugin-http").fetch;

const isTauriWeb =
  Platform.OS === "web" &&
  typeof window !== "undefined" &&
  window.location.hostname === "tauri.localhost";

let tauriFetchPromise: Promise<TauriFetch | null> | null = null;

const getTauriFetch = async (): Promise<TauriFetch | null> => {
  if (!isTauriWeb) return null;
  tauriFetchPromise ??= import("@tauri-apps/plugin-http")
    .then((module) => module.fetch)
    .catch((error) => {
      console.warn("Tauri HTTP plugin unavailable, falling back to browser fetch", error);
      return null;
    });
  return tauriFetchPromise;
};

export const isTauriDesktop = () => isTauriWeb;

/**
 * Uses Tauri's Rust HTTP client in the desktop WebView so school APIs are not
 * subject to browser CORS. Normal browsers keep the native Web Fetch API.
 */
export async function appFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const tauriFetch = await getTauriFetch();
  if (tauriFetch) {
    return tauriFetch(input as string | URL | Request, init);
  }
  return fetch(input, init);
}
