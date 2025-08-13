import * as Network from "expo-network";
import { ApiResponse } from "./types";

export async function isInternetReachable(): Promise<boolean> {
  const s = await Network.getNetworkStateAsync();
  return Boolean(s.isInternetReachable ?? s.isConnected);
}

export async function fetchJsonWithRetry<T>(
  url: string,
  retries = 3,
  backoffMs = 800
): Promise<T> {
  let last: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (e) {
      last = e;
      if (attempt < retries)
        await new Promise(r => setTimeout(r, backoffMs * attempt));
    }
  }
  throw new Error(`fetch-failed: ${String(last)}`);
}

export async function fetchLatestManifest(url: string) {
  return (await fetchJsonWithRetry<ApiResponse>(url)).model;
}
