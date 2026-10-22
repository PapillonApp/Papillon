export function GetIdentityFromPronoteUsername(str: string): { firstName: string; lastName: string } {
  const match = /[A-ZÀ-ÖØ-Þ]{2,}(?:[\s'-]+[A-ZÀ-ÖØ-Þ]{2,})*/.exec(str);

  if (match) {
    const lastName = match[0].trim();
    const firstName = str.replace(lastName, "").trim();
    return { firstName, lastName };
  }

  return { firstName: str.trim(), lastName: "" };
}
