export const lz = (num: number) => (num < 10 ? `0${num}` : num);

export const getDuration = (minutes: number): string => {
  const durationHours = Math.floor(minutes / 60);
  const durationRemainingMinutes = minutes % 60;

  if(durationHours === 0) {
    return `${durationRemainingMinutes} min`;
  }

  return `${durationHours}h ${lz(durationRemainingMinutes)}min`;
};