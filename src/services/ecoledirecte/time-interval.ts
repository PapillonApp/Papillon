export type Timeinterval = {
  start: string;
  end: string;
};

const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/**
* @param str "A string containing a date formatted as "mercredi 21 février 2024 de 08:10", will return the date for the specified day and hour"
*/
export function dateAsISO860 (str: string): string {
  const parts = str.split(" ");
  const timeIndex = parts.findIndex(part => part.includes(":"));
  const hour = parts[timeIndex].split(":");
  const monthIndex = parts.findIndex(part => months.includes(part));

  return (new Date(
    Number(parts[monthIndex + 1]),
    months.indexOf(parts[monthIndex]),
    Number(parts[monthIndex - 1]),
    Number(hour[0]),
    Number(hour[1])
  )).toISOString();
}

export function dateStringAsTimeInterval (
  str: string,
): Timeinterval | undefined {
  if (str.includes("du")) {
    /**
       * @example
       * str is equal to "du mercredi 21 février 2024 au jeudi 22 février 2024"
       * or "du mercredi 27 novembre 2024 à 08:10 au vendredi 06 décembre 2024 à 08:10"
       */
    const [startPart, endPart] = str.split("au").map(part => part.trim());
    let start = startPart.replace("du", "").trim();
    let end = endPart.trim();

    if (!start.includes(":")) {
      start += " de 00:00";
    } else {
      start = start.replace(" à ", " de ");
    }

    if (!end.includes(":")) {
      end += " de 23:59";
    } else {
      end = end.replace(" à ", " de ");
    }

    return {
      start: dateAsISO860(start),
      end: dateAsISO860(end)
    } as Timeinterval;
  }

  if (str.includes("le")) {
    /**
       * @example
       * str is equal to "le mercredi 21 février 2024 de 08:10 à 16:10"
       * or "le jeudi 22 février 2024"
       */
    const parts = str.split("à");
    let startDate: string;
    let endDate: string;

    // It's a full day ("le mercredi 21 février 2024")
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

/**
* Get the duration of interval in hours.
* @param interval
*/
/**
 * Get the duration of interval in hours.
 * @param interval
 */
export const getDurationInHours = (interval: Timeinterval): string => {
  const diff = new Date(interval.end).getTime() - new Date(interval.start).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h${minutes.toString().padStart(2, "0")}`;
};