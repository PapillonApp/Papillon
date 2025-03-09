import { format } from "date-fns";

export const formatDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};
