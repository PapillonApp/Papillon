import { Client } from "@blockshub/blocksdirecte";
import { addDays, format, startOfISOWeek } from "date-fns";

import { Attachment } from "../shared/attachment";
import { Homework, ReturnFormat } from "../shared/homework";
import { createEDCloudFileAttachment } from "./attachments";

interface EDCloudFileLike {
  id: number | string;
  libelle?: string;
  type?: string;
}

interface EDHomeworkLessonContentLike {
  idDevoir?: number;
  contenu?: string;
  documents?: EDCloudFileLike[];
}

interface EDHomeworkLike {
  idDevoir: number;
  contenu: string;
  rendreEnLigne: boolean;
  donneLe: string;
  effectue: boolean;
  ressourceDocuments?: EDCloudFileLike[];
  documents?: EDCloudFileLike[];
  documentsRendus?: EDCloudFileLike[];
  contenuDeSeance?: EDHomeworkLessonContentLike;
}

interface EDHomeworkSubjectLike {
  entityLibelle: string;
  matiere: string;
  codeMatiere: string;
  id: number;
  aFaire?: EDHomeworkLike;
  contenuDeSeance?: EDHomeworkLessonContentLike;
}

interface EDHomeworkUpcomingItemLike {
  documentsAFaire: boolean;
  effectue: boolean;
  idDevoir: number;
  matiere: string;
  rendreEnLigne: boolean;
}

export async function fetchEDHomeworks(
  session: Client,
  accountId: string,
  weekNumber: number
): Promise<Homework[]> {
  const weekdays = weekNumberToDaysList(weekNumber);
  const upcoming = await session.homework.getUpcomingHomework() as unknown as Record<
    string,
    EDHomeworkUpcomingItemLike[] | undefined
  >;

  const dailyResponses = await Promise.all(
    weekdays.map(async (date) => {
      const formattedDate = formatDate(date);
      const summaryEntries = normalizeUpcomingEntries(upcoming[formattedDate]);
      const matchedSummaryIds = new Set<number>();
      const { matieres = [] } = await session.homework.getHomeworksForDate(formattedDate) as {
        matieres?: EDHomeworkSubjectLike[];
      };
      const dayResponse: Homework[] = [];

      for (const subject of matieres) {
        const homework = mapEDHomeworkSubject(
          session,
          accountId,
          date,
          subject,
          summaryEntries,
          matchedSummaryIds
        );

        if (homework) {
          dayResponse.push(homework);
        }
      }

      for (const summaryEntry of summaryEntries) {
        if (!matchedSummaryIds.has(summaryEntry.idDevoir)) {
          dayResponse.push(createSummaryFallbackHomework(accountId, date, summaryEntry));
        }
      }

      return dayResponse;
    })
  );

  return dedupeHomeworks(dailyResponses.flat());
}

export async function setEDHomeworkAsDone(session: Client, homework: Homework, state?: boolean): Promise<Homework> {
  if (homework.supportsCompletion === false) {
    return homework;
  }

  const finalState = state ?? !homework.isDone
  const homeworkId = Number(homework.id)

  if (Number.isNaN(homeworkId)) {
    return homework;
  }
  
  if (finalState) {
    await session.homework.markHomeworkAsDone(homeworkId)
  } else {
    await session.homework.markHomeworkAsUndone(homeworkId)
  }
  return {
    ...homework,
    isDone: finalState
  }
}

export const weekNumberToDaysList = (weekNumber: number, year?: number): Date[] => {
  const currentYear = year || new Date().getFullYear();
  
  // Trouver le premier jour ISO de l'année (lundi de la semaine 1)
  const jan4 = new Date(currentYear, 0, 4); 
  const firstWeekStart = startOfISOWeek(jan4);
  
  // Calculer le lundi de la semaine demandée
  const weekStart = new Date(firstWeekStart);
  weekStart.setDate(firstWeekStart.getDate() + (weekNumber - 1) * 7);

  // Construire la liste des jours
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
};

export const formatDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

function normalizeUpcomingEntries(
  entries: EDHomeworkUpcomingItemLike[] | undefined
): EDHomeworkUpcomingItemLike[] {
  return Array.isArray(entries) ? entries : [];
}

function mapEDHomeworkSubject(
  session: Client,
  accountId: string,
  date: Date,
  subject: EDHomeworkSubjectLike,
  summaryEntries: EDHomeworkUpcomingItemLike[],
  matchedSummaryIds: Set<number>
): Homework | null {
  const homework = subject.aFaire;
  const summaryEntry = homework
    ? summaryEntries.find((entry) => entry.idDevoir === homework.idDevoir)
    : undefined;
  if (summaryEntry) {
    matchedSummaryIds.add(summaryEntry.idDevoir);
  }

  const lessonContent = mergeHtmlFragments(
    subject.contenuDeSeance?.contenu,
    homework?.contenuDeSeance?.contenu
  );
  const attachments = getEDHomeworkAttachments(session, accountId, subject);
  const hasWork = Boolean(homework);
  const hasLesson = lessonContent.trim().length > 0 || hasLessonAttachments(subject);

  if (!hasWork && !hasLesson) {
    return null;
  }

  return {
    id: String(
      homework?.idDevoir ??
        subject.contenuDeSeance?.idDevoir ??
        subject.id ??
        `${formatDate(date)}-${subject.codeMatiere}`
    ),
    subject: getEDHomeworkSubjectName(subject),
    content: homework?.contenu ?? "",
    lessonContent: lessonContent || undefined,
    dueDate: date,
    isDone: summaryEntry?.effectue ?? homework?.effectue ?? false,
    supportsCompletion: hasWork || Boolean(summaryEntry),
    returnFormat: homework
      ? homework.rendreEnLigne
        ? ReturnFormat.FILE_UPLOAD
        : ReturnFormat.PAPER
      : undefined,
    attachments,
    evaluation: false,
    custom: false,
    createdByAccount: accountId,
  };
}

function createSummaryFallbackHomework(
  accountId: string,
  date: Date,
  entry: EDHomeworkUpcomingItemLike
): Homework {
  const fallbackContent = entry.documentsAFaire
    ? "<p>Devoir disponible. Une piece jointe est annoncee par EcoleDirecte.</p>"
    : "<p>Devoir disponible.</p>";

  return {
    id: String(entry.idDevoir),
    subject: entry.matiere,
    content: fallbackContent,
    dueDate: date,
    isDone: entry.effectue,
    supportsCompletion: true,
    returnFormat: entry.rendreEnLigne ? ReturnFormat.FILE_UPLOAD : ReturnFormat.PAPER,
    attachments: [],
    evaluation: false,
    custom: false,
    createdByAccount: accountId,
  };
}

function getEDHomeworkSubjectName(subject: EDHomeworkSubjectLike): string {
  return subject.matiere.trim().length > 0 ? subject.matiere : subject.entityLibelle;
}

function hasLessonAttachments(subject: EDHomeworkSubjectLike): boolean {
  return (
    (subject.contenuDeSeance?.documents?.length ?? 0) > 0 ||
    (subject.aFaire?.contenuDeSeance?.documents?.length ?? 0) > 0
  );
}

function getEDHomeworkAttachments(
  session: Client,
  accountId: string,
  subject: EDHomeworkSubjectLike
): Attachment[] {
  return dedupeAttachments(
    [
      ...(subject.aFaire?.documents ?? []).map((file) =>
        createEDCloudFileAttachment(session, accountId, file, "homework")
      ),
      ...(subject.aFaire?.ressourceDocuments ?? []).map((file) =>
        createEDCloudFileAttachment(session, accountId, file, "homework-resource")
      ),
      ...(subject.aFaire?.documentsRendus ?? []).map((file) =>
        createEDCloudFileAttachment(session, accountId, file, "homework-submission")
      ),
      ...(subject.contenuDeSeance?.documents ?? []).map((file) =>
        createEDCloudFileAttachment(session, accountId, file, "lesson")
      ),
      ...(subject.aFaire?.contenuDeSeance?.documents ?? []).map((file) =>
        createEDCloudFileAttachment(session, accountId, file, "lesson")
      ),
    ].filter((attachment): attachment is Attachment => Boolean(attachment))
  );
}

function dedupeAttachments(attachments: Attachment[]): Attachment[] {
  const attachmentMap = new Map<string, Attachment>();

  for (const attachment of attachments) {
    const key = [
      attachment.metadata?.role ?? "unknown",
      attachment.metadata?.reference ?? attachment.url,
    ].join(":");
    if (!attachmentMap.has(key)) {
      attachmentMap.set(key, attachment);
    }
  }

  return Array.from(attachmentMap.values());
}

function dedupeHomeworks(homeworks: Homework[]): Homework[] {
  const homeworkMap = new Map<string, Homework>();

  for (const homework of homeworks) {
    const key = [
      homework.createdByAccount,
      formatDate(new Date(homework.dueDate)),
      homework.id,
      homework.subject,
    ].join(":");
    const current = homeworkMap.get(key);

    if (!current) {
      homeworkMap.set(key, homework);
      continue;
    }

    homeworkMap.set(key, {
      ...current,
      content: current.content || homework.content,
      lessonContent: mergeHtmlFragments(current.lessonContent, homework.lessonContent) || undefined,
      isDone: current.isDone || homework.isDone,
      supportsCompletion:
        current.supportsCompletion === false
          ? homework.supportsCompletion
          : current.supportsCompletion,
      attachments: dedupeAttachments([...current.attachments, ...homework.attachments]),
    });
  }

  return Array.from(homeworkMap.values());
}

function mergeHtmlFragments(...fragments: Array<string | undefined>): string {
  return Array.from(
    new Set(
      fragments
        .map((fragment) => fragment?.trim() ?? "")
        .filter((fragment) => fragment.length > 0)
    )
  ).join("\n");
}