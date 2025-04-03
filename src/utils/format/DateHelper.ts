import { formatDistance, isToday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";

export const timestampToString = (timestamp: number) => {
  if (isNaN(timestamp)) {
    return;
  }

  if (isToday(timestamp)) {
    return "Aujourd’hui";
  }

  if (isTomorrow(timestamp)) {
    return "Demain";
  }

  const mtn = new Date();
  mtn.setHours(0, 0, 0, 0);

  return formatDistance(new Date(timestamp), mtn, {
    locale: fr,
    addSuffix: true,
  });
};
