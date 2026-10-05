import { useAccountStore } from "@/stores/account";

import { cleanSubjectName } from "./utils";

// Colors already queued for persistence, keyed by account then subject. Render
// can call getSubjectColor many times before the store write lands; without
// this each call would queue its own write.
const pendingColors = new Map<string, string>();

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Deterministic for a given subject and set of already used colors, so
 * repeated renders never see the color change. Starts from a hash of the
 * subject and walks the palette to the first color no other subject uses.
 */
function pickColor(subject: string, usedColors: string[]): string {
  const start = hashString(subject) % Colors.length;
  for (let i = 0; i < Colors.length; i++) {
    const color = Colors[(start + i) % Colors.length];
    if (!usedColors.includes(color)) {
      return color;
    }
  }
  return Colors[start];
}

export function getSubjectColor(subject: string): string {
  const cleanedName = cleanSubjectName(subject)
  const { lastUsedAccount, accounts } = useAccountStore.getState();
  const account = accounts.find(a => a.id === lastUsedAccount);
  const subjects = account?.customisation?.subjects;
  const subjectProperties = subjects?.[cleanedName];
  if (subjectProperties && subjectProperties.color && subjectProperties.color !== "") {
    return subjectProperties.color;
  }

  const pendingKey = `${lastUsedAccount}:${cleanedName}`;
  const pending = pendingColors.get(pendingKey);
  if (pending) {
    return pending;
  }

  const usedColors = [
    ...Object.values(subjects ?? {}).map(item => item.color),
    ...[...pendingColors.entries()]
      .filter(([key]) => key.startsWith(`${lastUsedAccount}:`))
      .map(([, value]) => value),
  ];
  const color = pickColor(cleanedName ?? "", usedColors);

  // Without a matching account the write cannot stick; persisting would only
  // churn the store and re-render every subscriber.
  if (account) {
    pendingColors.set(pendingKey, color);
    setTimeout(() => {
      pendingColors.delete(pendingKey);
      useAccountStore.getState().setSubjectColor(cleanedName, color)
    }, 0)
  }

  return color;
}

export function getRandomColor(ignoredColors?: string[]) {
  if (ignoredColors && ignoredColors.length !== Colors.length) {
    const availableColors = Colors.filter(color => !ignoredColors.includes(color));
    
    if (availableColors.length > 0) {
      return availableColors[Math.floor(Math.random() * availableColors.length)];
    }
  }

  return Colors[Math.floor(Math.random() * Colors.length)];
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