import { useAccountStore } from "@/stores/account";

export function getSubjectName(subject: string): string {
  const cleanedName = cleanSubjectName(subject)
  const lastUsedAccount = useAccountStore.getState().lastUsedAccount;
  const subjectProperties = useAccountStore.getState().accounts.find(a => a.id === lastUsedAccount)?.customisation?.subjects[cleanedName]
  if (subjectProperties && subjectProperties.name !== "") {
    return subjectProperties.name;
  }

  useAccountStore.getState().setSubjectName(cleanedName, subject)
  return subject;
}

export function cleanSubjectName(subject: string): string {
  return subject
    .toLocaleLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s]/gi, '') // Remove special characters except spaces
}