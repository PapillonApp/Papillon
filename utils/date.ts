import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";

export function formatRelativeTime(date: Date): string {
  return formatDistance(date, new Date(), { 
    addSuffix: true, 
    locale: fr 
  });
}
