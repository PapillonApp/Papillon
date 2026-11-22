import { fetch } from "expo/fetch";
import { Parser } from "htmlparser2";

const loginPath = "/account/login/";

export function getPrepaPlusOrigin(input: string): string {
  const value = input.trim();
  const url = new URL(value.includes("://") ? value : `https://${value}`);
  if (
    url.protocol !== "https:" ||
    !(
      url.hostname === "prepas-plus.fr" ||
      url.hostname.endsWith(".prepas-plus.fr")
    ) ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error("Invalid Prépa Plus school address.");
  }
  return url.origin;
}

function readCookie(headers: Headers, name: "csrftoken" | "sessionid") {
  const values = headers.getSetCookie?.();
  const cookies = values?.length
    ? values.join(",")
    : (headers.get("set-cookie") ?? "");
  return new RegExp(`(?:^|,)\\s*${name}=([^;,\\s]+)`).exec(cookies)?.[1];
}

function readFormToken(html: string) {
  let token: string | undefined;
  const parser = new Parser({
    onopentag(name, attributes) {
      if (
        name === "input" &&
        attributes.type === "hidden" &&
        attributes.name === "csrfmiddlewaretoken" &&
        attributes.value
      ) {
        token ??= attributes.value;
      }
    },
  });
  parser.end(html);
  return token;
}

export async function loginPrepaPlus(
  baseUrl: string,
  username: string,
  password: string
) {
  const origin = getPrepaPlusOrigin(baseUrl);
  const loginUrl = origin + loginPath;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  const request = {
    credentials: "omit",
    redirect: "manual",
    signal: controller.signal,
  } as const;

  try {
    const page = await fetch(loginUrl, request);
    if (!page.ok) {
      throw new Error("Unable to load the Prépa Plus sign-in form.");
    }
    const token = readFormToken(await page.text());
    const cookie = readCookie(page.headers, "csrftoken");
    if (!token || !cookie) {
      throw new Error("The Prépa Plus sign-in form is incomplete.");
    }

    const response = await fetch(loginUrl, {
      ...request,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: `csrftoken=${cookie}`,
        Origin: origin,
        Referer: loginUrl,
      },
      body: new URLSearchParams({
        csrfmiddlewaretoken: token,
        "login_view-current_step": "auth",
        "auth-username": username,
        "auth-password": password,
      }).toString(),
    });
    const location = response.headers.get("location");
    const target = location ? new URL(location, loginUrl) : undefined;
    const session = readCookie(response.headers, "sessionid");
    if (
      (response.status !== 302 && response.status !== 303) ||
      target?.origin !== origin ||
      target.pathname.replace(/\/$/, "") === "/account/login" ||
      !session
    ) {
      throw new Error("Prépa Plus rejected the sign-in.");
    }
    return session;
  } finally {
    clearTimeout(timeout);
  }
}
