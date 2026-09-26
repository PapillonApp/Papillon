export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours && minutes) {return `${hours}h ${minutes} ${minutes > 1 ? "mins" : "min"}`;}
  if (hours) {return `${hours} ${hours > 1 ? "heures" : "heure"}`;}
  return `${minutes} ${minutes > 1 ? "mins" : "min"}`;
}