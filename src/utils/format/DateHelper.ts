export const timestampToString = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  let formattedDate: string;

  let dateDifference = [
    date.getFullYear() - today.getFullYear(),
    date.getMonth() - today.getMonth(),
    date.getDate() - today.getDate(),
  ];

  let yearDifference = Math.trunc(
    dateDifference[0] + dateDifference[1] / 12 + dateDifference[2] / 365
  );

  let monthDifference = Math.trunc(
    dateDifference[0] * 12 + dateDifference[1] + dateDifference[2] / 30.4
  );

  let dayDifference = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (yearDifference <= -1) {
    formattedDate = `Il y a ${0 - yearDifference} an${
      yearDifference < -1 ? "s" : ""
    }`;
  } else if (yearDifference >= 1) {
    formattedDate = `Dans ${yearDifference} an${yearDifference > 1 ? "s" : ""}`;
  } else {
    if (monthDifference < 0) {
      formattedDate = `Il y a ${0 - monthDifference} mois`;
    } else if (monthDifference > 0) {
      formattedDate = `Dans ${monthDifference} mois`;
    } else {
      if (dayDifference < -2) {
        formattedDate = `Il y a ${0 - dayDifference} jours`;
      } else if (dayDifference === -2) {
        formattedDate = "Avant-hier";
      } else if (dayDifference === -1) {
        formattedDate = "Hier";
      } else if (dayDifference === 0) {
        formattedDate = "Aujourd'hui";
      } else if (dayDifference === 1) {
        formattedDate = "Demain";
      } else if (dayDifference === 2) {
        formattedDate = "Après-demain";
      } else {
        formattedDate = `Dans ${dayDifference} jours`;
      }
    }
  }

  return formattedDate;
};
