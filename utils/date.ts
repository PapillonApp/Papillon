import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";

export const adjustToDeviceTimeZone = (date: Date): Date => {
  const apiOffset = 2 * 60 * 60 * 1000;
  const localOffset = new Date().getTimezoneOffset() * 60 * 1000;
  const totalOffset = localOffset + apiOffset;
  return new Date(date.getTime() - totalOffset);
};

export function formatRelativeTime(date: Date): string {
  return formatDistance(date, new Date(), { 
    addSuffix: true, 
    locale: fr 
  });
}
