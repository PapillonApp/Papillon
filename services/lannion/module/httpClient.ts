import {
  fetch,
  RequestInit as ExpoRequestInit,
  RequestMethod,
} from "expo-fetcher";

let cookies: Record<string, string> = {};

export function resetCookies() {
  cookies = {};
}

function getCookieHeader(): string {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

function updateCookies(headerValue: string | null) {
  if (!headerValue) {
    return;
  }

  const splitCookies = headerValue.split(/,(?=\s*[a-zA-Z0-9_-]+=)/);

  splitCookies.forEach(c => {
    const parts = c.split(";");
    const [keyVal] = parts;
    const eqIndex = keyVal.indexOf("=");

    if (eqIndex > -1) {
      const key = keyVal.substring(0, eqIndex).trim();
      let val = keyVal.substring(eqIndex + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      if (val && val !== "deleted" && val !== '""') {
        cookies[key] = val;
      }
    }
  });
}

export async function makeRequest(
  url: string,
  options: RequestInit = {}
): Promise<{ status: number; body: string; location?: string }> {
  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.method === "POST" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  const cookieHeader = getCookieHeader();
  if (cookieHeader) {
    headers["Cookie"] = cookieHeader;
  }

  const fetchOptions: ExpoRequestInit = {
    ...options,
    method: options.method as RequestMethod | undefined,
    headers,
    redirect: "manual",
    body:
      options.body === null
        ? undefined
        : typeof options.body === "string" ||
            options.body instanceof ArrayBuffer ||
            options.body instanceof Uint8Array
          ? options.body
          : undefined,
  };

  const response = await fetch(url, fetchOptions);

  const rawHeaders: any = response.headers;

  const setCookieHeader =
    rawHeaders?.get?.("set-cookie") ?? rawHeaders?.["set-cookie"] ?? null;
  if (setCookieHeader) {
    updateCookies(setCookieHeader);
  }

  const location =
    rawHeaders?.get?.("location") ?? rawHeaders?.["location"] ?? undefined;

  const body = await response.text();

  return {
    status: response.status,
    body,
    location,
  };
}

export function getPhpSessionId(): string | undefined {
  return cookies["PHPSESSID"];
}
