import { useAccountStore } from "@/stores/account";

import { cleanSubjectName } from "./name";

export function getSubjectColor(subject: string): string {
  const cleanedName = cleanSubjectName(subject)
  const lastUsedAccount = useAccountStore.getState().lastUsedAccount;
  const subjectProperties = useAccountStore.getState().accounts.find(a => a.id === lastUsedAccount)?.customisation?.subjects[cleanedName]
  if (subjectProperties && subjectProperties.color !== "") {
    return subjectProperties.color;
  }

  const color = getRandomColor()
  useAccountStore.getState().setSubjectColor(cleanedName, getRandomColor())
  return color;
}

export function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
