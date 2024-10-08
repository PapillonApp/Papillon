import important_json from "@/utils/magic/regex/important.json";

// Define the structure of a message
interface Message {
  title?: string;
  content: string;
  read: boolean;
  [key: string]: any; // Allow for any additional properties
}

interface CategorizedMessages {
  importantMessages: (Message & { matchCount: number; matchingWords: string[] })[];
  normalMessages: Message[];
}

export const categorizeMessages = (messages: Message[]): CategorizedMessages => {
  const importantMessages: (Message & { matchCount: number; matchingWords: string[] })[] = [];
  const normalMessages: Message[] = [];
  for (const message of messages) {
    const { title, content, read } = message;
    let matchCount = 0;
    const matchingWords: string[] = [];

    for (const regexArray of Object.values(important_json)) {
      for (const regex of regexArray) {
        const pattern = new RegExp(regex, "i");
        const titleMatches = title?.match(pattern);
        const contentMatches = content.match(pattern);

        // Filter out empty strings and add only non-empty matches to matchingWords
        if (titleMatches) {
          const nonEmptyTitleMatches = titleMatches.filter((match) => match && match.trim() !== "");
          if (nonEmptyTitleMatches.length > 0) {
            matchCount++;
            matchingWords.push(...nonEmptyTitleMatches);
          }
        }

        if (contentMatches) {
          const nonEmptyContentMatches = contentMatches.filter((match) => match && match.trim() !== "");
          if (nonEmptyContentMatches.length > 0) {
            matchCount++;
            matchingWords.push(...nonEmptyContentMatches);
          }
        }
      }
    };
    if (!message.title) {
      message.title = "";
    }

    if (matchCount > 0 && !read) {
      importantMessages.push({ ...message, matchCount, matchingWords, important: true });

      // Log the matching words or phrases for this message
      console.log(`Message Title: "${title}" matched the following words:`, matchingWords);
    } else {
      normalMessages.push(message);
    }
  }

  const limitedImportantMessages = importantMessages.slice(0, 3);

  return { importantMessages: limitedImportantMessages, normalMessages };
};
