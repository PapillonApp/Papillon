/**
 * Educational French Language Helper
 * 
 * This module provides gentle educational features to help users improve their French.
 * It's designed to be helpful and educational, not punitive.
 */

import { checkFrenchPreferences, getFrenchSuggestionMessage } from "./french-preferences";
import { log } from "@/utils/logger/logger";

/**
 * Educational logger that provides gentle French suggestions
 */
export const logFrenchSuggestion = (text: string, context: string = "text") => {
  const suggestions = checkFrenchPreferences(text);
  
  if (suggestions.length > 0) {
    const message = getFrenchSuggestionMessage(suggestions);
    log(`📚 ${message} (contexte: ${context})`, "french-education");
    return suggestions;
  }
  
  return [];
};

/**
 * Check if user is using preferred French expressions
 * Returns true if the text uses good French, false if suggestions are available
 */
export const isGoodFrench = (text: string): boolean => {
  const suggestions = checkFrenchPreferences(text);
  return suggestions.length === 0;
};

/**
 * Educational mode: returns the text with gentle improvements if any
 */
export const educationalMode = (text: string, enableSuggestions: boolean = true): {
  improved: string;
  hasSuggestions: boolean;
  suggestions: string[];
} => {
  const suggestions = checkFrenchPreferences(text);
  
  if (enableSuggestions && suggestions.length > 0) {
    logFrenchSuggestion(text, "educational-mode");
  }
  
  return {
    improved: text, // Don't auto-correct, just suggest
    hasSuggestions: suggestions.length > 0,
    suggestions: suggestions.map(s => getFrenchSuggestionMessage([s]))
  };
};