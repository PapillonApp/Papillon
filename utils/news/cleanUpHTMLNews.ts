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
    
    // 4. Block Segmentation: Replace structural/unwanted tags (span, div, br) with the block delimiter.
    cleaned = cleaned.replace(/<\/?(?:span|div|br)\b[^>]*>/ig, specialDelimiter);

    // 5. Clean up redundant delimiters and trim.
    cleaned = cleaned.replace(new RegExp(`${specialDelimiter}+`, 'g'), specialDelimiter);
    cleaned = cleaned.replace(new RegExp(`^${specialDelimiter}|${specialDelimiter}$`, 'g'), '');


    // 6. Structural Normalization (Paragraph/List Creation):
    const blocks = cleaned.split(specialDelimiter)
        .map(block => block.trim())
        .filter(block => block.length > 0);

    let finalHtml = '';
    // Regex to detect blocks starting with a bullet point (• or -) followed by optional space.
    const listMarkerRegex = /^[\•\-]\s*(.*)$/;
    // Updated set of allowed tags for cleanup step a)
    const allowedTagsRegex = 'h[1-4]|p|b|i|a|u|ul|ol|li';

    blocks.forEach((block) => {
        // a) Remove remaining disallowed tags from within the block, keeping their content.
        block = block.replace(new RegExp(`<(?!\/?(?:${allowedTagsRegex})\\b)[^>]+>`, 'ig'), '').trim();

        if (block.length === 0) return; // Skip empty blocks after cleanup

        // Prevent nested <p> tags by stripping leading/trailing <p> tags from the block content
        block = block.replace(/^<p>\s*/i, '').replace(/\s*<\/p>$/i, '').trim();

        const listMatch = block.match(listMarkerRegex);

        if (listMatch) {
            // This block looks like a list item
            const listItemContent = listMatch[1].trim();

            // *** USER REQUESTED LOGIC (INVALID HTML BUT REQUIRED) ***
            // Encapsulate each list item in its own <ul> block, followed by the specialDelimiter.
            finalHtml += `<ul><li>${listItemContent}</li></ul>${specialDelimiter}`;
            // *******************************************************

        } else {
            // This block is NOT a list item
            
            // Treat as a standard paragraph, followed by the specialDelimiter.
            finalHtml += `<p>${block}</p>${specialDelimiter}`;
        }
    });

    // 7. Final cleanup for a **single line**: replace specialDelimiter with an empty string.
    // This removes all delimiters, resulting in a continuous single line of HTML.
    return finalHtml.trim()
        .replace(new RegExp(specialDelimiter + '+$'), '') // Remove trailing delimiters
        .replace(new RegExp(`${specialDelimiter}+`, 'g'), '') // **KEY CHANGE:** Replace all remaining delimiters with an empty string
        .replace(/\s+/g, ' '); // **Optional:** Collapse all remaining whitespace (including spaces between tags) to a single space for maximum compression.
};