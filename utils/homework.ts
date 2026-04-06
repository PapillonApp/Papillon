import { Attachment } from "@/services/shared/attachment";
import { Homework } from "@/services/shared/homework";
import { formatHTML } from "@/utils/format/html";
import { generateId } from "@/utils/generateId";

function toHomeworkDateString(dueDate: Homework["dueDate"]): string {
  return new Date(dueDate).toDateString();
}

export type HomeworkSectionKey = "work" | "lesson";

export interface HomeworkSection {
  key: HomeworkSectionKey;
  content: string;
  attachments: Attachment[];
}

export function hasHomeworkContent(homework: Pick<Homework, "content">): boolean {
  return homework.content.trim().length > 0;
}

export function hasHomeworkLessonContent(
  homework: Pick<Homework, "lessonContent">
): boolean {
  return homework.lessonContent?.trim().length ? true : false;
}

export function getHomeworkWorkAttachments(
  homework: Pick<Homework, "attachments">
): Attachment[] {
  return homework.attachments.filter(
    (attachment) => attachment.metadata?.role !== "lesson"
  );
}

export function getHomeworkLessonAttachments(
  homework: Pick<Homework, "attachments">
): Attachment[] {
  return homework.attachments.filter(
    (attachment) => attachment.metadata?.role === "lesson"
  );
}

export function hasHomeworkAttachments(
  homework: Pick<Homework, "attachments">
): boolean {
  return homework.attachments.length > 0;
}

export function hasHomeworkWorkAttachments(
  homework: Pick<Homework, "attachments">
): boolean {
  return getHomeworkWorkAttachments(homework).length > 0;
}

export function hasHomeworkLessonAttachments(
  homework: Pick<Homework, "attachments">
): boolean {
  return getHomeworkLessonAttachments(homework).length > 0;
}

export function getHomeworkPrimaryContent(
  homework: Pick<Homework, "content" | "lessonContent">
): string {
  if (hasHomeworkContent(homework)) {
    return homework.content;
  }

  return homework.lessonContent ?? "";
}

export function getHomeworkCombinedHtml(
  homework: Pick<Homework, "content" | "lessonContent">
): string {
  return [homework.content, homework.lessonContent]
    .filter((value): value is string => Boolean(value && value.trim().length))
    .join("\n");
}

export function getHomeworkPlainText(
  homework: Pick<Homework, "content" | "lessonContent">,
  nobreak = true
): string {
  return formatHTML(getHomeworkCombinedHtml(homework), nobreak).trim();
}

export function getHomeworkPreviewText(
  homework: Pick<Homework, "content" | "lessonContent">
): string {
  return formatHTML(getHomeworkPrimaryContent(homework), true).trim();
}

export function getHomeworkSections(
  homework: Pick<Homework, "content" | "lessonContent" | "attachments">
): HomeworkSection[] {
  const sections: HomeworkSection[] = [];
  const workAttachments = getHomeworkWorkAttachments(homework);
  const lessonAttachments = getHomeworkLessonAttachments(homework);

  if (hasHomeworkContent(homework) || workAttachments.length > 0) {
    sections.push({
      key: "work",
      content: homework.content,
      attachments: workAttachments,
    });
  }

  if (hasHomeworkLessonContent(homework) || lessonAttachments.length > 0) {
    sections.push({
      key: "lesson",
      content: homework.lessonContent ?? "",
      attachments: lessonAttachments,
    });
  }

  return sections;
}

export function getHomeworkCacheId(
  homework: Pick<
    Homework,
    "subject" | "content" | "lessonContent" | "createdByAccount" | "dueDate"
  >
): string {
  return generateId(
    homework.subject +
      homework.content +
      (homework.lessonContent ?? "") +
      homework.createdByAccount +
      toHomeworkDateString(homework.dueDate)
  );
}

export function getHomeworkLegacyCacheIds(
  homework: Pick<
    Homework,
    "subject" | "content" | "lessonContent" | "createdByAccount" | "dueDate"
  >
): string[] {
  const date = toHomeworkDateString(homework.dueDate);

  return Array.from(
    new Set(
      [
        generateId(homework.subject + homework.content + homework.createdByAccount),
        generateId(
          homework.subject +
            homework.content +
            homework.createdByAccount +
            date
        ),
        generateId(
          homework.subject +
            homework.content +
            (homework.lessonContent ?? "") +
            homework.createdByAccount
        ),
      ].filter((value) => value !== getHomeworkCacheId(homework))
    )
  );
}
