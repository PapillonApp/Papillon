export const formatHTML = (html: string, nobreak: boolean = false) => {
  // Remove all HTML tags
  let text = html.replace(/<[^>]*>/g, '');

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
  if (nobreak) {
    text = text.replace(/[\r\n]+/g, ' ');
  }
  return text;
}