const lesson_formats = require("../data/lesson_formats.json");

const uppercaseFirst = (txt: string): string => {
  let newTxt = txt.charAt(0).toUpperCase() + txt.slice(1);
  return newTxt;
};

function removeSpaces (text: string): string {
  return text.replace(/\s+/g, "");
}

function findObjectByPronoteString (pronoteString = "") {
  // Process the input string: replace dots and underscores with spaces, trim, and convert to lowercase
  let processedString = pronoteString
    .replace(/[,._]/g, " ")
    .trim()
    .toLowerCase();

  // remove everything after > (included)
  processedString = processedString.split(">")[0].trim();

  // remove LV1, LV2, etc.
  processedString = processedString.replace(/lv\d/g, "").trim();

  // remove everything in parentheses
  processedString = processedString.replace(/\(.*\)/g, "").trim();

  // normalize accents
  processedString = processedString
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // remove special characters
  processedString = processedString.replace(/[^a-zA-Z0-9 ]/g, " ").trim();

  // remove multiple spaces into one
  processedString = processedString.replace(/\s+/g, " ");

  // Search for the object in the data
  for (let item of lesson_formats) {
    for (let format of item.formats.default) {
      if (format.toLowerCase() === processedString) {
        return item;
      }
    }
  }

  // Return a new object if no match is found
  return {
    label: removeSpaces(processedString),
    pretty: formatPretty(processedString),
    formats: {}
  };
}

function formatPretty (text: string): string {
  const upperCaseTerms = ["CM", "TD", "TP", "LV1", "LV2", "LV3", "LVA", "LVB", "LVC", "SAE", "PPP"];
  let words = text.split(" ");
  words = words.map(word => {
    if (upperCaseTerms.includes(word.toUpperCase())) {
      return word.toUpperCase();
    }
    return uppercaseFirst(word);
  });
  return words.join(" ");
}

function getCourseSpeciality (pronoteString = ""): string | null {
  if (!pronoteString.includes(">")) {
    return null;
  }

  let newPrnString = pronoteString.split(">").pop()?.trim().toLowerCase();
  if (!newPrnString) return null;

  newPrnString = newPrnString.replace("expression", "expr.");
  newPrnString = newPrnString.replace("compréhension", "comp.");
  newPrnString = newPrnString.replace("ecrit", "écrit");
  newPrnString = newPrnString.replace("sae", "saé");
  newPrnString = formatPretty(newPrnString);

  return newPrnString;
}

export default findObjectByPronoteString;
export { getCourseSpeciality };