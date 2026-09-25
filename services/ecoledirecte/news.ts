import { Buffer } from "buffer";

import { Client } from "@blockshub/blocksdirecte";

import { warn } from "@/utils/logger/logger";

import { News } from "../shared/news";

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

export async function fetchEDNews(session: Client, accountId: string): Promise<News[]> {
  try {
    const timeline = await session.timeline.getPublicTimeline();
    return mapEDNews((timeline.postits ?? []) as EDTimelinePostit[], accountId);
  } catch (error) {
    warn(`ED public timeline failed: ${String(error)}`);
    return [];
  }
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
