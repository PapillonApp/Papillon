import { useAccountStore } from "@/stores/account";
import lessonFormats from "./lesson_formats.json";

function normalizeSubjectName(subject: string): string {
  if (!subject) return "";
  return subject
    .split(/\s*[>|]\s*/)[0]
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/gi, "")
    .replace(/s$/, "");
}

export function getSubjectName(subject: string): string {
  const cleanedName = cleanSubjectName(subject);
  const lastUsedAccount = useAccountStore.getState().lastUsedAccount;
  const subjectProperties = useAccountStore
    .getState()
    .accounts.find(a => a.id === lastUsedAccount)?.customisation?.subjects[
    cleanedName
  ];
  if (subjectProperties && subjectProperties.name !== "") {
    return subjectProperties.name;
  }

  const normalizedSubject = normalizeSubjectName(subject);

  const foundFormat = lessonFormats.find(format => {
    if (normalizeSubjectName(format.label) === normalizedSubject) {
      return true;
    }

    return format.formats.some(formatVariant => {
      const normalizedVariant = normalizeSubjectName(formatVariant);
      return normalizedVariant === normalizedSubject;
    });
  });

  const prettyName = foundFormat?.pretty || subject;
  useAccountStore.getState().setSubjectName(cleanedName, prettyName);
  return prettyName;
}

export function cleanSubjectName(subject: string): string {
  if (!subject) return subject;
  return subject
    .toLocaleLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/gi, "");
}
