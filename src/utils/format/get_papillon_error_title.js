var expressions = [
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
];
export var getErrorTitle = function () {
    return expressions[Math.floor(Math.random() * expressions.length)];
};
