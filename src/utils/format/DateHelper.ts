// First check if Intl.RelativeTimeFormat is available
const isRelativeTimeFormatSupported =
  typeof Intl !== "undefined" &&
  Intl.RelativeTimeFormat &&
  typeof Intl.RelativeTimeFormat === "function";

// Create formatters with fallback
const createFormatter = (options: {
  numeric: "always" | "auto";
  style: "long" | "short" | "narrow";
}) => {
  if (isRelativeTimeFormatSupported) {
    try {
      return new Intl.RelativeTimeFormat("fr", options);
    } catch (e) {
      console.error("Error creating RelativeTimeFormat:", e);
      // Fallback formatting function
      return {
        format: (value: number, unit: Intl.RelativeTimeFormatUnit) => {
          const abs = Math.abs(value);
          if (unit === "days") {
            return value === 0
              ? "aujourd'hui"
              : value === 1
                ? "demain"
                : value === -1
                  ? "hier"
                  : `dans ${abs} jours`;
          }
          if (unit === "months") {
            return `dans ${abs} mois`;
          }
          if (unit === "years") {
            return `dans ${abs} ans`;
          }
          return `dans ${abs} ${unit}`;
        },
      };
    }
  }
  // Fallback if RelativeTimeFormat is not supported
  return {
    format: (value: number, unit: Intl.RelativeTimeFormatUnit) => {
      const abs = Math.abs(value);
      return `dans ${abs} ${unit}`;
    },
  };
};

const numericDateFormatter = createFormatter({
  numeric: "always",
  style: "long",
});

const dateFormatter = createFormatter({
  numeric: "auto",
  style: "long",
});

export const timestampToString = (timestamp: number): string => {
  if (!timestamp) {
    return "Date invalide";
  }

  const date = new Date(timestamp);
  const today = new Date();

  // Reset hours to avoid time-of-day complications
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  // Calculate differences
  const dateDifference = [
    date.getFullYear() - today.getFullYear(),
    date.getMonth() - today.getMonth(),
    date.getDate() - today.getDate(),
  ];

  const yearDifference = Math.trunc(
    dateDifference[0] + dateDifference[1] / 12 + dateDifference[2] / 365
  );

  const monthDifference = Math.trunc(
    dateDifference[0] * 12 + dateDifference[1] + dateDifference[2] / 30.4
  );

  const dayDifference = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let formattedDate: string;

  try {
    if (yearDifference === 0) {
      if (monthDifference === 0) {
        formattedDate = dateFormatter.format(dayDifference, "days");
      } else {
        formattedDate = numericDateFormatter.format(monthDifference, "months");
      }
    } else {
      formattedDate = numericDateFormatter.format(yearDifference, "years");
    }

    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  } catch (error) {
    console.error("Error formatting date:", error);
    return `dans ${Math.abs(dayDifference)} jours`;
  }
};
