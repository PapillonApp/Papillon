export const timestampToString = (timestamp: number) => {

  if (!timestamp || Number.isNaN(timestamp)) {
    return "Date invalide";
  }

  const date = new Date(timestamp);
  const today = new Date();
  if (Number.isNaN(date.getTime())) {
    return "Date invalide";
  }

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  let formattedDate: string;

  let dateDifference = [
    date.getFullYear() - today.getFullYear(),
    date.getMonth() - today.getMonth(),
    date.getDate() - today.getDate(),
  ];

  let yearDifference = dateDifference[0];
  if (dateDifference[1] < 0 || (dateDifference[1] === 0 && dateDifference[2] < 0)) {
    yearDifference--;
  } else if (dateDifference[1] > 0 || (dateDifference[1] === 0 && dateDifference[2] > 0)) {
    yearDifference++;
  }
  let monthDifference = dateDifference[0] * 12 + dateDifference[1];

  if (dateDifference[2] < 0) {
    monthDifference--;
  } else if (dateDifference[2] > 0) {
    monthDifference++;
  }
  let dayDifference = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (yearDifference < 0) {
    formattedDate = `Il y a ${Math.abs(yearDifference)} an${
      Math.abs(yearDifference) > 1 ? "s" : ""
    }`;
  } else if (yearDifference > 0) {
    formattedDate = `Dans ${yearDifference} an${yearDifference > 1 ? "s" : ""}`;
  } else {
    if (monthDifference < 0) {
      formattedDate = `Il y a ${Math.abs(monthDifference)} mois`;
    } else if (monthDifference > 0) {
      formattedDate = `Dans ${monthDifference} mois`;
    } else {
      if (dayDifference < -2) {
        formattedDate = `Il y a ${Math.abs(dayDifference)} jours`;
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
