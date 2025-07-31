export const getHolidayEmoji = (date: Date = new Date()): string => {
  const year = date.getFullYear();

  const periods = [
    { start: new Date(`${year}-12-31`), end: new Date(`${year}-01-01`), emoji: "🎇" }, // Nouvel An
    { start: new Date(`${year}-04-10`), end: new Date(`${year}-04-10`), emoji: "🥚" }, // Lundi de Pâques
    { start: new Date(`${year}-05-01`), end: new Date(`${year}-05-01`), emoji: "💼" }, // Fête du Travail
    { start: new Date(`${year}-05-08`), end: new Date(`${year}-05-08`), emoji: "💐" }, // Armistice 1945
    { start: new Date(`${year}-05-18`), end: new Date(`${year}-05-18`), emoji: "🌿" }, // Ascension
    { start: new Date(`${year}-05-29`), end: new Date(`${year}-05-29`), emoji: "🕊️" }, // Lundi de Pentecôte
    { start: new Date(`${year}-07-14`), end: new Date(`${year}-07-14`), emoji: "🇫🇷" }, // Fête Nationale
    { start: new Date(`${year}-08-15`), end: new Date(`${year}-08-15`), emoji: "🌻" }, // Assomption
    { start: new Date(`${year}-11-01`), end: new Date(`${year}-11-01`), emoji: "🕯️" }, // Toussaint
    { start: new Date(`${year}-11-11`), end: new Date(`${year}-11-11`), emoji: "💐" }, // Armistice 1918
    { start: new Date(`${year}-12-25`), end: new Date(`${year}-12-25`), emoji: "🎄" }, // Noël
    { start: new Date(`${year}-10-19`), end: new Date(`${year}-11-04`), emoji: "🍂" }, // Vacances de la Toussaint
    { start: new Date(`${year}-12-21`), end: new Date(`${year}-01-06`), emoji: "❄️" }, // Vacances de Noël
    { start: new Date(`${year}-02-08`), end: new Date(`${year}-03-10`), emoji: "⛷️" }, // Vacances d'hiver
    { start: new Date(`${year}-04-05`), end: new Date(`${year}-04-28`), emoji: "🐝" }, // Vacances de printemps
    { start: new Date(`${year}-07-05`), end: new Date(`${year}-09-01`), emoji: "🏖️" }, // Grandes vacances
  ];

  return periods.find((period) => date >= period.start && date <= period.end)?.emoji ?? "🏝️";
};
