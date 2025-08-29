import type { Fetcher } from "@literate.ink/utilities";

// PRONOTE weird user-agent check
export const customFetcher: Fetcher = async (options) => {
  console.time(options.url.href);

  const response = await fetch(options.url, {
    method: options.method,
    headers: {
      ...options.headers,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 PRONOTE Mobile APP Version/2.0.11"
    },
    body: options.method !== "GET" ? options.content : void 0,
    redirect: options.redirect
  });

  const content = await response.text();
  console.timeEnd(options.url.href);

  return {
    content,
    status: response.status,

    get headers() {
      console.info("-> Reading headers from fetcher !");
      return response.headers;
    }
  };
};