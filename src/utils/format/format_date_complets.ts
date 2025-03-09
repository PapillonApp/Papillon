import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

function formatDate (date: string): string {
  const messageDate = new Date(date);

  if (Number.isNaN(messageDate.getTime())) {
    return "Date invalide";
  }

  return formatDistanceToNow(messageDate, { addSuffix: true, locale: fr });
}

export default formatDate;
