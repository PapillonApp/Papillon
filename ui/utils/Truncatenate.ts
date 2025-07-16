export function truncatenateString(
  str: string,
  maxLength: number,
  ellipsis = "…"
): string {
  if (str.length <= maxLength) {
    return str;
  }
  const truncated = str.slice(0, maxLength - ellipsis.length);
  return `${truncated}${ellipsis}`;
}