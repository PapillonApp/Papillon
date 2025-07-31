/**
 * French Language Preferences Utility
 * 
 * This utility helps maintain consistent and preferred French expressions
 * throughout the Papillon app, promoting proper French language usage.
 */

export interface FrenchTextSuggestion {
  original: string;
  preferred: string;
  reason?: string;
}

/**
 * Common French expression preferences
 */
export const FRENCH_PREFERENCES: FrenchTextSuggestion[] = [
  {
    original: "ça fonctionne",
    preferred: "ça marche",
    reason: "Plus idiomatique en français courant"
  },
  {
    original: "fonctionne correctement",
    preferred: "marche correctement",
    reason: "Expression plus naturelle"
  },
  {
    original: "fonctionnement",
    preferred: "fonctionnement", // This one is actually fine as a noun
    reason: "Acceptable en tant que nom"
  }
];

/**
 * Checks if text contains expressions that could be improved
 */
export const checkFrenchPreferences = (text: string): FrenchTextSuggestion[] => {
  const suggestions: FrenchTextSuggestion[] = [];
  
  for (const preference of FRENCH_PREFERENCES) {
    const lowerText = text.toLowerCase();
    const lowerOriginal = preference.original.toLowerCase();
    
    if (lowerText.indexOf(lowerOriginal) !== -1 && 
        preference.original !== preference.preferred) {
      suggestions.push(preference);
    }
  }
  
  return suggestions;
};

/**
 * Applies preferred French expressions to text
 */
export const applyFrenchPreferences = (text: string): string => {
  let improvedText = text;
  
  for (const preference of FRENCH_PREFERENCES) {
    if (preference.original !== preference.preferred) {
      // Replace case-insensitive
      const regex = new RegExp(preference.original, 'gi');
      improvedText = improvedText.replace(regex, preference.preferred);
    }
  }
  
  return improvedText;
};

/**
 * Get a friendly suggestion message for better French
 */
export const getFrenchSuggestionMessage = (suggestions: FrenchTextSuggestion[]): string => {
  if (suggestions.length === 0) return "";
  
  const suggestion = suggestions[0];
  return `💡 Suggestion: "${suggestion.preferred}" est plus idiomatique que "${suggestion.original}"`;
};