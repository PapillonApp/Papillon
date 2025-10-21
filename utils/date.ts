import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";

export const adjustToDeviceTimeZone = (date: Date): Date => {
  const parisTimeStr = date.toLocaleString('fr-FR', { 
    timeZone: 'Europe/Paris',
    timeZoneName: 'short'
  });
  const isSummerTime = parisTimeStr.includes('UTC+2');
  const apiOffset = isSummerTime ? 2 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000;
  const localOffset = new Date().getTimezoneOffset() * 60 * 1000;
  const totalOffset = localOffset + apiOffset;
  const result = new Date(date.getTime() - totalOffset);
  return result;
};

export function formatRelativeTime(date: Date): string {
  return formatDistance(date, new Date(), { 
    addSuffix: true, 
    locale: fr 
  });
}
