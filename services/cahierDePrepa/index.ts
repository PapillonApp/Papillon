import {
  CahierDePrepa as CahierDePrepaClient,
  type DocumentsPage,
  type RecentItem,
} from "cahier-de-prepa";

import { mapRecentItemsToHomeworks } from "@/services/cahierDePrepa/mapping";
import { Homework } from "@/services/shared/homework";
import { News } from "@/services/shared/news";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Auth, Services } from "@/stores/account/types";

const BASE_URL_KEY = "baseUrl";
const USERNAME_KEY = "username";
const PASSWORD_KEY = "password";

export type CahierDePrepaAuth = Auth & {
  additionals?: {
    baseUrl?: string;
    username?: string;
    password?: string;
    [key: string]: string | number | undefined;
  };
};

export function normalizeCahierDePrepaUrl(value: string): string {
  const url = new URL(value.trim());
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Cahier de Prépa instance URL must use HTTP(S).");
  }
  url.hash = "";
  url.search = "";
  if (!url.pathname.endsWith("/")) {
    url.pathname += "/";
  }
  return url.toString();
}

export function mapRecentItem(
  item: RecentItem,
  accountId: string,
  index: number
): News {
  const sourceId = item.href ?? `${item.title}:${index}`;
  const parsedDate = item.date ? new Date(item.date) : undefined;
  return {
    id: `cahier-de-prepa:${sourceId}`,
    title: item.title || undefined,
    createdAt:
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate
        : new Date(0),
    acknowledged: false,
    attachments: [],
    content: item.text,
    author: "Cahier de Prépa",
    category: "Cahier de Prépa",
    createdByAccount: accountId,
    ref: item.href,
  };
}

export class CahierDePrepa implements SchoolServicePlugin {
  displayName = "Cahier de Prépa";
  service = Services.CAHIER_DE_PREPA;
  capabilities: Capabilities[] = [
    Capabilities.REFRESH,
    Capabilities.NEWS,
    Capabilities.HOMEWORK,
  ];
  authData: Auth = {};
  session: CahierDePrepaClient | undefined;
  private readonly accountId: string;
  private refreshInFlight: Promise<CahierDePrepa> | null = null;

  constructor(accountId: string) {
    this.accountId = accountId;
  }

  async refreshAccount(credentials: Auth): Promise<CahierDePrepa> {
    const auth = credentials as CahierDePrepaAuth;
    const baseUrl = auth.additionals?.[BASE_URL_KEY];
    const username = auth.additionals?.[USERNAME_KEY];
    const password = auth.additionals?.[PASSWORD_KEY];
    if (
      typeof baseUrl !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username ||
      !password
    ) {
      throw new Error("Cahier de Prépa credentials are incomplete.");
    }

    const client = new CahierDePrepaClient(normalizeCahierDePrepaUrl(baseUrl));
    try {
      await client.login(username, password);
    } catch {
      throw new Error("Cahier de Prépa authentication failed.");
    }
    this.authData = credentials;
    this.session = client;
    return this;
  }

  private async getSession(): Promise<CahierDePrepaClient> {
    if (this.session) {
      return this.session;
    }
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.refreshAccount(this.authData).finally(() => {
        this.refreshInFlight = null;
      });
    }
    const refresh = this.refreshInFlight;
    return (await refresh).session!;
  }

  async getNews(): Promise<News[]> {
    const recent = await (await this.getSession()).recent.get();
    return recent.items.map((item, index) =>
      mapRecentItem(item, this.accountId, index)
    );
  }

  async getHomeworks(weekNumber: number): Promise<Homework[]> {
    const recent = await (await this.getSession()).recent.get();
    return mapRecentItemsToHomeworks(recent.items, this.accountId, weekNumber);
  }

  async getDocuments(folderId?: string): Promise<DocumentsPage> {
    return (await this.getSession()).documents.list(folderId);
  }

  async downloadDocument(documentId: string, download = "") {
    return (await this.getSession()).documents.download(documentId, download);
  }
}

export const cahierDePrepaAuthKeys = {
  BASE_URL_KEY,
  USERNAME_KEY,
  PASSWORD_KEY,
} as const;
