const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7B731",
  "#6A5ACD",
  "#FF69B4",
  "#20B2AA",
  "#FF7F50",
  "#9370DB",
  "#3CB371",
  "#FF4500",
  "#1E90FF",
  "#FFD700",
  "#8A2BE2",
  "#32CD32",
  "#FF1493",
  "#00CED1",
  "#FF8C00",
  "#7B68EE",
  "#00FA9A",
  "#DC143C",
  "#1ABC9C",
  "#F39C12",
  "#8E44AD",
  "#2ECC71",
  "#E74C3C",
  "#3498DB",
  "#F1C40F",
  "#9B59B6",
  "#2980B9",
  "#E67E22",
  "#27AE60",
  "#D35400"
];

function seedRandom (seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return function () {
    h = (Math.imul(31, h) + 1) | 0;
    return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
  };
}

function getRandomItemFromList (list: Array<string>, seed: string) {
  if (list.length === 0) return null;
  const random = seedRandom(seed);
  const randomIndex = Math.floor(random() * list.length);
  return list[randomIndex];
}

export const selectColorSeed = (subject: string) => {
  return getRandomItemFromList(colors, subject) as string;
};
