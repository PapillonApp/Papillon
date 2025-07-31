const expressions = [
  { label: "Zut !", emoji: "😬" },
  { label: "Mince !", emoji: "😕" },
  { label: "Flûte !", emoji: "😮" },
  { label: "Sapristi !", emoji: "😲" },
  { label: "Quelle poisse !", emoji: "😣" },
  { label: "Eh bien, voilà !", emoji: "😳" },
  { label: "Crotte !", emoji: "😓" },
  { label: "Oh non !", emoji: "😢" },
  { label: "Hélas !", emoji: "😟" },
  { label: "Catastrophe !", emoji: "😱" },
  { label: "Mince !", emoji: "😕" },
  { label: "Flûte !", emoji: "😮" },
  { label: "Oh non !", emoji: "😢" },
  { label: "Catastrophe !", emoji: "😱" }
] as const;

export const getErrorTitle = (): typeof expressions[number] => {
  return expressions[Math.floor(Math.random() * expressions.length)];
};
