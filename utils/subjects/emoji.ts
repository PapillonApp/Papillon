import { useAccountStore } from "@/stores/account";
import { cleanSubjectName } from "./name";

export function getSubjectEmoji(subject: string): string {
    const cleanedName = cleanSubjectName(subject)
    const lastUsedAccount = useAccountStore.getState().lastUsedAccount;
    const subjectProperties = useAccountStore.getState().accounts.find(a => a.id === lastUsedAccount)?.customisation?.subjects[cleanedName]
    if (subjectProperties && subjectProperties.emoji !== "") {
        return subjectProperties.emoji;
    }

    // TODO: Logique de Lucas avec Kora ou Regex
    useAccountStore.getState().setSubjectEmoji(cleanedName, "🤓")
    return "🤓";
}