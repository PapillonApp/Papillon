export function clock(date: Date, language: string): string {
  return date.toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" });
}

export function until(date: Date, now: Date): number {
  return Math.ceil((date.getTime() - now.getTime()) / 60_000);
}

export function minutes(seconds: number): number {
  if (seconds <= 0) {
    return 0;
  }
  return Math.max(1, Math.round(seconds / 60));
}
