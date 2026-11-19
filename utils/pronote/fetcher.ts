import type { Fetcher } from "@literate.ink/utilities";

// Pawnote queues a session's requests: one that never answers (Android has no
// fetch timeout) would freeze the session and the login waiting on it.
const REQUEST_TIMEOUT_MS = 60 * 1000;

// PRONOTE weird user-agent check
export const customFetcher: Fetcher = async (options) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(options.url, {
      method: options.method,
      headers: {
        ...options.headers,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 PRONOTE Mobile APP Version/2.0.11"
      },
      body: options.method !== "GET" ? options.content : void 0,
      redirect: options.redirect,
      signal: controller.signal
    });

    const content = await response.text();

    return {
      content,
      status: response.status,

      get headers() {
        return response.headers;
      }
    };
  } finally {
    clearTimeout(timeout);
  }
};
