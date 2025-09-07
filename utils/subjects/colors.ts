import { useAccountStore } from "@/stores/account";

import { cleanSubjectName } from "./name";

export function getSubjectColor(subject: string): string {
  const cleanedName = cleanSubjectName(subject)
  const lastUsedAccount = useAccountStore.getState().lastUsedAccount;
  const subjectProperties = useAccountStore.getState().accounts.find(a => a.id === lastUsedAccount)?.customisation?.subjects[cleanedName]
  if (subjectProperties && subjectProperties.color !== "") {
    if (subjectProperties.color === undefined) {
      return Colors[0]
    }
    return subjectProperties.color;
  }

  const subjects = useAccountStore.getState().accounts.find(a => a.id === lastUsedAccount)?.customisation?.subjects
  const ignoredColors = Object.values(subjects ?? {}).map(item => item.color)

  const color = getRandomColor(ignoredColors)
  useAccountStore.getState().setSubjectColor(cleanedName, color)
  return color;
}

export function getRandomColor(ignoredColors?: string[]) {
  if (ignoredColors && ignoredColors.length !== Colors.length) {
    const availableColors = Colors.filter(color => !ignoredColors.includes(color));
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  }
  return Colors[Math.floor(Math.random() * Colors.length)]
}

export const Colors = [
  "#C50017",
  "#DA2400",
  "#DD6B00",
  "#E8901C",
  "#E8B048",
  "#6BAE00",
  "#37BB12",
  "#12BB67",
  "#26B290",
  "#26ABB2",
  "#2DB9D8",
  "#009EC5",
  "#007FDA",
  "#3A56D0",
  "#7600CA",
  "#962DD8",
  "#B300CA",
  "#C50066",
  "#DD004A",
  "#DD0030"
]