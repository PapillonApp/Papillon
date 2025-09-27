interface ParsedDescription {
  type: string | null;
  group: string | null;
  groups?: string[];
  teacher: string | null;
  room?: string | null;
  content?: string | null;
}

export function parseHyperplanningDescription(description: string): ParsedDescription | null {
  if (!description) return null;

  // Clean the description from HTML tags and DESCRIPTION prefix
  const cleanedDescription = description
    .replace(/^DESCRIPTION;LANGUAGE=fr:/, '')
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/\\n/g, '\n') // Convert literal \n to actual newlines
    .trim();

  const lines = cleanedDescription.split('\n').filter(line => line.trim() !== '');

  let type: string | null = null;
  let teacher: string | null = null;
  let group: string | null = null;
  let room: string | null = null;
  let content: string | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Extract subject/type
    if (trimmedLine.startsWith('Matière :')) {
      type = trimmedLine.replace('Matière :', '').trim();
    }

    // Extract teacher
    else if (trimmedLine.startsWith('Enseignant :')) {
      teacher = trimmedLine.replace('Enseignant :', '').trim();
    }

    // Extract promotion/group
    else if (trimmedLine.startsWith('Promotion :')) {
      group = trimmedLine.replace('Promotion :', '').trim();
    }

    // Extract room
    else if (trimmedLine.startsWith('Salle :')) {
      room = trimmedLine.replace('Salle :', '').trim();
    }

    // Extract pedagogical content
    else if (trimmedLine.startsWith('Contenu pédagogique')) {
      // Find content after this line
      const contentIndex = lines.findIndex(l => l.trim().startsWith('Contenu pédagogique'));
      if (contentIndex !== -1 && contentIndex + 1 < lines.length) {
        // Join remaining lines as content, cleaned up
        content = lines
          .slice(contentIndex + 1)
          .join(' ')
          .replace(/Travail sur le projet trimestriel : élaboration/g, '')
          .replace(/font-weight:bold/g, '')
          .replace(/font-family:[^;]+;/g, '')
          .replace(/font-size:[^;]+;/g, '')
          .trim();
      }
    }
  }

  // If no structured data found, try to extract basic info
  if (!type && !teacher && !group) {
    // Fallback: try to find any recognizable patterns
    const subjectMatch = cleanedDescription.match(/Matière\s*:\s*([^\n]+)/i);
    const teacherMatch = cleanedDescription.match(/Enseignant\s*:\s*([^\n]+)/i);
    const groupMatch = cleanedDescription.match(/Promotion\s*:\s*([^\n]+)/i);

    if (subjectMatch) type = subjectMatch[1].trim();
    if (teacherMatch) teacher = teacherMatch[1].trim();
    if (groupMatch) group = groupMatch[1].trim();
  }

  return {
    type: type || 'Cours',
    teacher: teacher || 'Inconnu',
    group: group || 'Inconnu',
    room: room || undefined,
    content: content || undefined
  };
}

export function isHyperplanningDescription(description: string): boolean {
  if (!description) return false;

  return description.includes('Matière :') ||
         description.includes('Enseignant :') ||
         description.includes('Promotion :') ||
         description.includes('DESCRIPTION;LANGUAGE=fr:');
}