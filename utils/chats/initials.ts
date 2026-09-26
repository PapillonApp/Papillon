export function getInitials(name: string): string {
  let rgx = /(\p{L})\p{L}*|\p{L}/gu;
  let matches = [...name.matchAll(rgx)];

  let initials = (
    (matches.shift()?.[1] || '') + (matches.pop()?.[1] || '')
  ).toUpperCase();

  return initials;
}