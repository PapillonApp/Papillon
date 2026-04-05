import { Buffer } from "buffer";

import { Client } from "@blockshub/blocksdirecte";

import { warn } from "@/utils/logger/logger";

import { News } from "../shared/news";

const ED_PUBLIC_TIMELINE_VERSION = "4.97.2";
const ED_APP_TIMELINE_VERSION = "7.8.2";
const ED_MOBILE_USER_AGENT =
  "BlocksDirecte/1.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 EDMOBILE v7.8.2";

type EDTimelinePostit = {
  id: number | string;
  type?: string;
  contenu: string;
  dateCreation: string;
  auteur?: {
    prenom?: string;
    nom?: string;
  };
};

type EDPublicTimelineResponse = {
  code: number;
  message?: string;
  data?: {
    evenements?: unknown[];
    postits?: EDTimelinePostit[];
  };
};

type EDAccount = {
  id: string | number;
  typeCompte: string;
  accessToken?: string;
};

type EDClientRuntime = {
  credentials?: {
    token?: string;
  };
  restManager?: {
    post<T>(path: string, body: object, headers?: Record<string, string>): Promise<T>;
  };
};

export async function fetchEDNews(session: Client, accountId: string): Promise<News[]> {
  let websitePostits: EDTimelinePostit[] = [];

  try {
    const websiteTimeline = await fetchEDWebsitePublicTimeline(session);
    websitePostits = websiteTimeline.data?.postits ?? [];
  } catch (error) {
    warn(`ED website public timeline failed: ${String(error)}`);
  }

  if (websitePostits.length > 0) {
    return mapEDNews(websitePostits, accountId);
  }

  try {
    const fallbackTimeline = await session.timeline.getPublicTimeline();
    return mapEDNews((fallbackTimeline.postits ?? []) as EDTimelinePostit[], accountId);
  } catch (error) {
    warn(`ED app public timeline failed: ${String(error)}`);
    return [];
  }
}

async function fetchEDWebsitePublicTimeline(session: Client): Promise<EDPublicTimelineResponse> {
  const selectedAccount = session.auth.getAccount() as EDAccount;
  const sessionRuntime = session as unknown as EDClientRuntime;
  const sessionToken = sessionRuntime.credentials?.token;
  const tokenCandidates = Array.from(
    new Set([selectedAccount.accessToken, sessionToken].filter((value): value is string => Boolean(value)))
  );

  if (!selectedAccount?.id || !selectedAccount?.typeCompte || tokenCandidates.length === 0) {
    throw new Error("Missing EcoleDirecte account context for public timeline fetch");
  }

  let firstSuccessfulPayload: EDPublicTimelineResponse | undefined;
  const errors: string[] = [];

  for (const version of [ED_APP_TIMELINE_VERSION, ED_PUBLIC_TIMELINE_VERSION]) {
    for (const token of tokenCandidates) {
      const payload = await requestEDWebsitePublicTimeline(sessionRuntime, selectedAccount, token, version);

      if (payload.code === 200) {
        if ((payload.data?.postits?.length ?? 0) > 0) {
          return payload;
        }

        firstSuccessfulPayload ??= payload;
        continue;
      }

      errors.push(`v=${version} code=${payload.code}${payload.message ? ` (${payload.message})` : ""}`);
    }
  }

  if (firstSuccessfulPayload) {
    return firstSuccessfulPayload;
  }

  throw new Error(errors.join(" | ") || "Unable to fetch ED public timeline");
}

async function requestEDWebsitePublicTimeline(
  session: EDClientRuntime,
  account: EDAccount,
  token: string,
  version: string
): Promise<EDPublicTimelineResponse> {
  if (version === ED_APP_TIMELINE_VERSION && session.restManager?.post) {
    try {
      return await session.restManager.post<EDPublicTimelineResponse>(
        `/v3/${account.typeCompte}/${account.id}/timelineAccueilCommun.awp?verbe=get`,
        {},
        { "X-Token": token }
      );
    } catch {
      // Fall through to manual request below.
    }
  }

  const endpoint = `https://api.ecoledirecte.com/v3/${account.typeCompte}/${account.id}/timelineAccueilCommun.awp?verbe=get&v=${version}`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": ED_MOBILE_USER_AGENT,
    "X-Token": token,
  };

  const postResponse = await fetch(endpoint, {
    method: "POST",
    body: new URLSearchParams({
      data: JSON.stringify({}),
    }).toString(),
    headers,
  });

  if (postResponse.ok) {
    return (await postResponse.json()) as EDPublicTimelineResponse;
  }

  const getResponse = await fetch(endpoint, {
    method: "GET",
    headers,
  });

  if (!getResponse.ok) {
    throw new Error(`Failed to fetch ED public timeline: ${getResponse.status} ${getResponse.statusText}`);
  }

  return (await getResponse.json()) as EDPublicTimelineResponse;
}

function mapEDNews(news: EDTimelinePostit[], accountId: string): News[] {
  return news.map(item => {
    const content = decodePostitContent(item.contenu);
    const plainText = extractPlainText(content);

    return {
      id: String(item.id),
      title: derivePostitTitle(plainText, item.type),
      createdAt: parseFrenchSlashDate(item.dateCreation) ?? new Date(),
      createdByAccount: accountId,
      acknowledged: true,
      attachments: [],
      content,
      author: [item.auteur?.prenom, item.auteur?.nom].filter(Boolean).join(" "),
      category: "Actualités"
    };
  });
}

function decodePostitContent(content: string): string {
  const sanitized = content
    .replace(/^data:[^;]+;base64,/i, "")
    .replace(/\s+/g, "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  if (!sanitized || sanitized.length < 16 || sanitized.length % 4 === 1) {
    return content;
  }

  const normalized = sanitized.padEnd(
    sanitized.length + ((4 - (sanitized.length % 4)) % 4),
    "="
  );

  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(normalized)) {
    return content;
  }

  try {
    const decoded = Buffer.from(normalized, "base64").toString("utf-8");
    return /<[a-z][\s\S]*>/i.test(decoded) ? decoded : content;
  } catch {
    return content;
  }
}

function extractPlainText(content: string): string {
  return content
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\n/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function derivePostitTitle(plainText: string, type?: string): string {
  if (plainText) {
    const firstSentence = plainText.split(/(?<=[.!?])\s+/).find(Boolean) ?? plainText;
    const normalized = firstSentence.trim();
    return normalized.length > 80 ? `${normalized.slice(0, 77)}...` : normalized;
  }

  switch ((type ?? "").toLowerCase()) {
  case "alerte":
    return "Alerte";
  case "info":
    return "Information";
  default:
    return "Post-it";
  }
}

function parseFrenchSlashDate(value: string): Date | undefined {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return undefined;
  }

  const parsed = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), 0, 0, 0, 0);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
