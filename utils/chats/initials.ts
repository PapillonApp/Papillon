export function getInitials(name: string): string {
  const rgx = /(\p{L})\p{L}*|\p{L}/gu;
  const matches = [...name.matchAll(rgx)];

  const initials = (
    (matches.shift()?.[1] || '') + (matches.pop()?.[1] || '')
  ).toUpperCase();

  return initials;
}