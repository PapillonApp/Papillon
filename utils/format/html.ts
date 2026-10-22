export const formatHTML = (html: string, nobreak: boolean = false) => {
  // Remove all HTML tags
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, '');

  // Decode HTML entities
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    // Add more entities as needed
  };
  text = text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    if (entities[entity]) return entities[entity];
    // Handle numeric entities
    if (/^&#\d+;/.test(entity)) {
      return String.fromCharCode(Number(entity.replace(/[^0-9]/g, '')));
    }
    if (/^&#x[0-9a-fA-F]+;/.test(entity)) {
      return String.fromCharCode(parseInt(entity.replace(/[^0-9a-fA-F]/g, ''), 16));
    }
    return entity;
  });
  
  text = text
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (nobreak) {
    text = text.replace(/[\r\n]+/g, ' ');
  }
  return text;
}