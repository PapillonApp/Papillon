interface ParsedDescription {
  type: string | null;
  group: string | null;
  groups?: string[];
  teacher: string | null;
}

export function parseADEDescription(description: string): ParsedDescription | null {
  const lines = description.replace(/^DESCRIPTION:\s*/, '').replace(/\([^)]*\)/g, '').split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');

  if (lines.length === 0) {
    return null;
  }

  const extractValue = (line: string | undefined): string | null => {
    if (!line) return null;
    const trimmed = line.trim();
    return trimmed === '' ? null : trimmed;
  };

  const isGroupPattern = (line: string): boolean => {
    const trimmed = line.trim().toUpperCase();
    return (
      /^(TP|TD|CM|COURS|GROUPE)\s*[0-9]*[A-ZÀ-ÖØ-Ý]*$/i.test(trimmed) ||
      /^GROUPE\s+[A-Z0-9À-ÖØ-Ý]+$/i.test(trimmed) ||
      /^[A-Z]{2,3}\d*$/i.test(trimmed) ||
      /^[A-Z]\d*$/i.test(trimmed)
    );
  };

  const isTeacherName = (line: string): boolean => {
    const trimmed = line.trim().toUpperCase();
    return /^[A-ZÀ-ÖØ-Ý]+(?:-[A-ZÀ-ÖØ-Ý]+)?(?:\s+[A-ZÀ-ÖØ-Ý]+(?:-[A-ZÀ-ÖØ-Ý]+)?)+$/.test(trimmed);
  };

  const allLinesAreGroups = lines.length > 1 && lines.every(isGroupPattern);
  if (allLinesAreGroups) {
    return {
      type: null,
      group: null,
      groups: lines,
      teacher: null,
    };
  }

  switch (lines.length) {
    case 1:
      return {
        type: null,
        group: extractValue(lines[0]),
        teacher: null,
      };

    case 2:
      const firstLine = lines[0];
      const secondLine = lines[1];

      if (isTeacherName(secondLine)) {
        return {
          type: null,
          group: extractValue(firstLine),
          teacher: extractValue(secondLine),
        };
      }

      return {
        type: extractValue(firstLine),
        group: extractValue(secondLine),
        teacher: null,
      };

    case 3:
      return {
        type: extractValue(lines[0]),
        group: extractValue(lines[2]),
        teacher: extractValue(lines[1]),
      };

    default:
      return {
        type: extractValue(lines[0]),
        group: extractValue(lines[1]),
        teacher: extractValue(lines[2]),
      };
  }
}

export function enhanceADEUrl(url: string): string {
  if (!url.includes('firstDate') && !url.includes('lastDate')) {
    let newUrl = url;
    if (url.includes('nbWeeks')) {
      newUrl = newUrl.split('nbWeeks=')[0];
    }
    // newUrl += '&firstDate=2000-01-01&lastDate=2038-01-01';
    return newUrl;
  }
  return url;
}
