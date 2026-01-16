import { ParsedEventData } from "../../event-converter";
import { ICalEvent } from "../../ical";
import { parseADEDescription } from "../ade-parser";

const typesDescription = {
  "TD": "Travail dirigé",
  "TP": "Travail pratique",
  "CM": "Cours magistral",
  "DS": "Devoir surveillé",
  "ALT": "Alt",
  "SUIVI": "Suivi"
}

function parseCourseLabel(label) {
  const clean = label.replace(/^LOG\s+/, '').trim();
  const tokens = clean.split(/\s+/);
  
  const types = ['TD', 'TP', 'CM', 'DS', 'SUIVI', 'ALT'];
  
  const typeIndex = tokens.findIndex(t => types.includes(t.toUpperCase()));

  const identifier = tokens[0];

  if (typeIndex === -1) {
    return {
      name: identifier,
      identifier: identifier,
      type: "N/A",
      group: tokens.slice(1).join(' ')
    };
  }

  let type = tokens[typeIndex];
  let offset = 1;

  if (type.toUpperCase() === 'SUIVI' && tokens[typeIndex + 1]?.toUpperCase() === 'ALT') {
    type = "Suivi Alt";
    offset = 2;
  }

  const nameParts = tokens.slice(1, typeIndex);
  const name = nameParts.length > 0 ? nameParts.join(' ') : identifier;

  return {
    name: name,
    identifier: identifier,
    type: type,
    group: tokens.slice(typeIndex + offset).join(' ')
  };
}

export function parseUR1Ical(
  event: ICalEvent
): ParsedEventData | null {
  const ADEDescription = parseADEDescription(event.description || '');
  if(!ADEDescription) {
    return null;
  }

  const parsedLabel = parseCourseLabel(event.summary || null);

  const newSummary = parsedLabel?.name;

  return {
    ...ADEDescription,
    summary: newSummary,
    group: parsedLabel?.group,
    courseType: parsedLabel?.type ? parsedLabel.type in typesDescription ? typesDescription[parsedLabel.type] : parsedLabel.type : null
  };
}