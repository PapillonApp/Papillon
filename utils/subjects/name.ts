import { useAccountStore } from "@/stores/account";
import { cleanSubjectName, getSubjectFormat } from "./utils";

export { cleanSubjectName };

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

  const foundFormat = getSubjectFormat(subject);

  const prettyName = foundFormat?.pretty || subject;
  useAccountStore.getState().setSubjectName(cleanedName, prettyName);
  return prettyName;
}
