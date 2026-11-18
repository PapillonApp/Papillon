import {
  Attachment as PawnoteAttachment,
  news as PawnoteNews,
  NewsInformation,
  newsInformationAcknowledge,
  NewsQuestion,
  NewsSurvey,
  SessionHandle,
} from "@blockshub/pawnote-lts";

import { Attachment } from "@/services/shared/attachment";
import { News } from "@/services/shared/news";

function mapAttachments(
  attachments: ReadonlyArray<PawnoteAttachment> | undefined,
  accountId: string
): Attachment[] {
  return (attachments ?? []).map(attachment => ({
    type: attachment.kind,
    name: attachment.name,
    url: attachment.url,
    createdByAccount: accountId,
  }));
}

function buildSurveyHtml(questions: ReadonlyArray<NewsQuestion> | undefined): string {
  const sortedQuestions = [...(questions ?? [])].sort(
    (a, b) => a.position - b.position
  );
  const parts: string[] = [];

  for (const question of sortedQuestions) {
    const title = question.fullTitle || question.title;
    if (title) {
      parts.push(`<p><b>${title}</b></p>`);
    }
    if (question.content) {
      parts.push(question.content);
    }
    if (question.choices?.length) {
      const items = [...question.choices]
        .sort((a, b) => a.position - b.position)
        .map(choice => `<li>${choice.value}</li>`)
        .join("");
      parts.push(`<ul>${items}</ul>`);
    }
  }

  return parts.join("");
}

/**
 * Fetches news from PRONOTE.
 * @param {SessionHandle} session - The session handle for the PRONOTE account.
 * @param {string} accountId - The ID of the account requesting the news.
 * @returns {Promise<News[]>} A promise that resolves to an array of News objects.
 */
export async function fetchPronoteNews(
  session: SessionHandle,
  accountId: string
): Promise<News[]> {
  const result: News[] = [];
  const response = await PawnoteNews(session);

  for (const item of response.items ?? []) {
    const isSurvey = item.is === "survey";
    const survey = isSurvey ? (item as NewsSurvey) : undefined;
    const info = !isSurvey ? (item as NewsInformation) : undefined;

    result.push({
      id: item.id,
      title: item.title,
      createdAt: item.creationDate,
      acknowledged: info ? info.acknowledged || info.read : item.read,
      attachments: isSurvey
        ? (survey?.questions ?? []).flatMap(q =>
          mapAttachments(q.attachments, accountId)
        )
        : mapAttachments(info?.attachments, accountId),
      content: isSurvey ? buildSurveyHtml(survey?.questions) : (info?.content ?? ""),
      author: item.author,
      category: item.category?.name ?? "",
      ref: info,
      createdByAccount: accountId,
      question: isSurvey,
    });
  }

  return result;
}

export async function setPronoteNewsAsAcknowledged(
  session: SessionHandle,
  news: News
): Promise<News> {
  const ref = news.ref as Partial<NewsInformation> | undefined;
  if (!ref || ref.is !== "information" || !ref.needToAcknowledge) {
    return news;
  }

  await newsInformationAcknowledge(session, ref as NewsInformation);
  return {
    ...news,
    acknowledged: true,
  };
}
