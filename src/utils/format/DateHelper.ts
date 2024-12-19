export const timestampToString = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const difference = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return difference === 0
    ? "Aujourd'hui"
    : difference === 1
      ? "Demain"
      : difference === 2
        ? "Après-demain"
        : `Dans ${difference} jours`;
};
