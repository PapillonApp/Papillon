import { differenceInCalendarDays, format, startOfDay } from "date-fns";
import * as DateLocale from "date-fns/locale";
import { t } from "i18next";

import i18n from "@/utils/i18n";

export const currentLocale = () =>
  DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS;

export const formatRelativeDayLabel = (day: Date, at: Date, pattern = "EEEE") => {
  const distance = differenceInCalendarDays(day, startOfDay(at));

  if (distance <= 0) {
    return t("Today");
  }

  if (distance === 1) {
    return t("Tomorrow");
  }

  return format(day, pattern, { locale: currentLocale() });
};
