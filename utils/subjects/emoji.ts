import { useAccountStore } from "@/stores/account";

import { cleanSubjectName, getSubjectFormat } from "./utils";

export function getSubjectEmoji(subject: string): string {
  const cleanedName = cleanSubjectName(subject);
  const lastUsedAccount = useAccountStore.getState().lastUsedAccount;
  const subjectProperties = useAccountStore
    .getState()
    .accounts.find(a => a.id === lastUsedAccount)?.customisation?.subjects[
    cleanedName
  ];
  if (subjectProperties && subjectProperties.emoji !== "") {
    return subjectProperties.emoji;
  }

  const foundFormat = getSubjectFormat(subject);

  const emoji = foundFormat?.emoji || "🤓";
  useAccountStore.getState().setSubjectEmoji(cleanedName, emoji);
  return emoji;
}
