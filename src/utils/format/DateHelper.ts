import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";

export const timestampToString = (timestamp: number) => {
  if (isNaN(timestamp)) {
    return;
  }
  return formatDistance(new Date(timestamp), new Date(), {
    locale: fr,
    addSuffix: true,
  });
};
