export function GetIdentityFromPronoteUsername(str: string): {firstName: string, lastName: string} {
  const lastName = /[A-Z][A-Z\s]+$/.exec(str)?.join(" ") ?? ""
  let firstName = str
  if (lastName) {
    firstName = str.replace(lastName, "").trim()
  }
  return  { firstName, lastName}
}