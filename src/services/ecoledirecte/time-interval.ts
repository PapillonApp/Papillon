export type Timeinterval = {
  start: string;
  end: string;
};

const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/**
 * @param str "A string containing a date formatted as "mercredi 21 février 2024 de 00:00", will return the date for the specified day and hour"
 */
export function dateAsISO860 (str: string): string {
  const parts = str.split(" ");
  const hour = parts[5].split(":");
  return (new Date(Number(parts[3]), months.indexOf(parts[2]), Number(parts[5]), Number(hour[0]), Number(hour[1]))).toISOString();
}

export function dateStringAsTimeInterval (
  str: string,
): Timeinterval | undefined {
  if (str.includes("du")) {
    /**
         * @example
         * str is equal to "du mercredi 21 février 2024 au jeudi 22 février 2024"
         */
    const parts = str.split("au");
    const start = dateAsISO860(parts[0].replace("du", "").trim());
    const end = dateAsISO860(parts[1].trim());
    return { start: start, end: end } as Timeinterval;
  }
  if (str.includes("le")) {
    /**
         * @example
         * str is equal to "le mercredi 21 février 2024 de 08:55 à 09:45"
         * or "le mercredi 21 février 2024"
         */
    const parts = str.split("à");

    let startDate: string;
    let endDate: string;

    // C'est une journée complète ("le mercredi 21 février 2024")
    if (!str.includes(":")) {
      startDate = `${parts[0].replace("le", "").trim()} de 00:00`;
      endDate = `${parts[0].split("de")[0].replace("le", "").trim()} de 23:59`;
    } else {
      startDate = parts[0].replace("le", "").trim();
      endDate = `${parts[0].split("de")[0].replace("le", "").trim()} de ${parts[1].trim()}`;
    }
    const start = dateAsISO860(startDate);
    const end = dateAsISO860(endDate);
    return { start: start, end: end } as Timeinterval;
  }
  return undefined;
}

/**
 * Get the duration of interval in hours.
 * @param interval
 */
export const getDuration = (interval: Timeinterval): Date => {
  return new Date(new Date(interval.end).getTime() - new Date(interval.start).getTime());
};
