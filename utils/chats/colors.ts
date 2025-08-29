import { Colors } from "../subjects/colors"

export function getProfileColorByName (name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % Colors.length);
  return Colors[index];
}