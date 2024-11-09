function parse_initials (content: string) {
  content = content.trimStart().trimEnd();
  if (content === "") return "??";
  let initials = content.split(" ").map((word) => word[0].toUpperCase()).join("");

  if (initials.length === 0) {
    if (content.split(" ").length === 1) initials = content;
    else initials = "??";
  } else if (initials.length === 3) initials = initials.slice(1); // We assume it's in the format M. J. Dupont ou MMe. C. Dupont
  return initials;
}

export default parse_initials;