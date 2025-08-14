import { Colors} from "../subjects/colors"

export function getProfileColorByName (name: string): string {
  return Colors[name.length % Colors.length];
}