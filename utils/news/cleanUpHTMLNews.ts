export const cleanHtmlForArticle = (htmlString: string): string => {
  // 1. Define the unique block delimiter
  const specialDelimiter = '<br />';

  // 2. Pre-cleanup: Normalize whitespace, remove comments, and common entities
  let cleaned = htmlString
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces with standard space
    .replace(/\r/g, '') // Remove carriage returns
    .trim();

  // --- Core Cleaning Steps ---

  // 3. Remove all attributes (style, class, id, etc.) except for 'href' on 'a' tags.
  cleaned = cleaned.replace(/<([a-z0-9]+)(\s+[^>]*)*>/ig, (match, tagName) => {
    const lowerTag = tagName.toLowerCase();

    // Custom logic for <a>: keep the href attribute
    if (lowerTag === 'a') {
      const hrefMatch = match.match(/href=["']([^"']+)["']/i);
      const href = hrefMatch ? ` href="${hrefMatch[1]}"` : '';
      return `<a${href}>`;
    }

    // For all other tags, remove all attributes
    return `<${lowerTag}>`;
  });

  // 4. Keep inline <span> content inline; split only block/break tags (div, p, br).
  cleaned = cleaned.replace(/<\/?span\b[^>]*>/ig, '');
  cleaned = cleaned.replace(/<\/?(?:div|p|br)\b[^>]*>/ig, specialDelimiter);

  // 5. Clean up redundant delimiters and trim.
  cleaned = cleaned.replace(new RegExp(`${specialDelimiter}+`, 'g'), specialDelimiter);
  cleaned = cleaned.replace(new RegExp(`^${specialDelimiter}|${specialDelimiter}$`, 'g'), '');

  // 6. Structural Normalization (Paragraph/List Creation):
  const blocks = cleaned.split(specialDelimiter)
    .map(block => block.trim())
    .filter(block => block.length > 0);

  let finalHtml = '';
  // Regex to detect blocks starting with a bullet point (• or -) followed by optional space.
  const listMarkerRegex = /^[•-]\s*(.*)$/;
  // Updated set of allowed tags for cleanup step a)
  const allowedTagsRegex = 'h[1-4]|p|b|i|a|u|ul|ol|li';

  blocks.forEach((block) => {
    // a) Remove remaining disallowed tags from within the block, keeping their content.
    block = block.replace(new RegExp(`<(?!/?(?:${allowedTagsRegex})\\b)[^>]+>`, 'ig'), '').trim();

    if (block.length === 0) {
      return; // Skip empty blocks after cleanup
    }

    // Prevent nested <p> tags by stripping leading/trailing <p> tags from the block content
    block = block.replace(/^<p>\s*/i, '').replace(/\s*<\/p>$/i, '').trim();

    const listMatch = block.match(listMarkerRegex);

    if (listMatch) {
      const listItemContent = listMatch[1].trim();
      finalHtml += `<ul><li>${listItemContent}</li></ul>${specialDelimiter}`;
    } else if (/^<(?:ul|ol|h[1-4])\b/i.test(block)) {
      finalHtml += `${block}${specialDelimiter}`;
    } else {
      finalHtml += `<p>${block}</p>${specialDelimiter}`;
    }
  });

  // 7. Final cleanup for a single line: replace specialDelimiter with an empty string.
  return finalHtml.trim()
    .replace(new RegExp(specialDelimiter + '+$'), '')
    .replace(new RegExp(`${specialDelimiter}+`, 'g'), '')
    .replace(/\s+/g, ' ');
};
