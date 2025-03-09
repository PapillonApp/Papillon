import {
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
} from "date-fns";
import { fr } from "date-fns/locale";

export const timestampToString = (timestamp: number) => {
  if (!timestamp || Number.isNaN(timestamp)) {
    return "Date invalide";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Date invalide";
  }

  if (isToday(date)) {
    return "Aujourd'hui";
  } else if (isTomorrow(date)) {
    return "Demain";
  } else if (isYesterday(date)) {
    return "Hier";
  } else {
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  }
};
