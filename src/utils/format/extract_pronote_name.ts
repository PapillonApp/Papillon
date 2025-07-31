function upperFirst (str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function upperName (name: string): string {
  return name.split("-").map(upperFirst).join("-");
}

export default function extract_pronote_name (fullName: string) {
  const regex = /^([\p{L} \-]+) ([\p{L}\-]+.*)$/u;
  const match = fullName.match(regex);

  if (match) {
    const lastName = match[1].trim();
    const firstNames = match[2].trim();
    return {
      familyName: upperName(lastName),
      givenName: firstNames
    };
  } else {
    return {
      familyName: fullName,
      givenName: fullName
    };
  }
}
