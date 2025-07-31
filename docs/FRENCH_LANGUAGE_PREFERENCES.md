# French Language Preferences Feature

This feature provides gentle educational suggestions for French language usage within the Papillon app.

## Purpose

The feature promotes consistent and idiomatic French expressions, helping users improve their French while using the app. It's designed to be educational and helpful, not punitive.

## How it works

### 1. Text Analysis
The system analyzes text in chat messages and discussions for common French expressions that could be improved.

### 2. Gentle Suggestions
When certain expressions are detected (like "ça fonctionne" vs "ça marche"), the system logs gentle suggestions to help users learn more idiomatic French.

### 3. Educational Focus
- **No blocking**: Users can still send messages with any expressions
- **No banning**: This is purely educational, not punitive
- **Logging only**: Suggestions are logged for educational purposes
- **Respectful**: Promotes good French while respecting user choice

## Supported Expressions

Currently supports suggestions for:
- "ça fonctionne" → "ça marche" (more idiomatic)
- "fonctionne correctement" → "marche correctement" (more natural)

## Implementation

### Files
- `src/utils/language/french-preferences.ts` - Core utility functions
- `src/utils/language/french-education.ts` - Educational helper functions
- `src/services/chats.ts` - Integration with chat services

### Usage
```typescript
import { checkFrenchPreferences, getFrenchSuggestionMessage } from "@/utils/language/french-preferences";

const text = "Ça fonctionne bien !";
const suggestions = checkFrenchPreferences(text);
if (suggestions.length > 0) {
  const message = getFrenchSuggestionMessage(suggestions);
  console.log(message); // "💡 Suggestion: "ça marche" est plus idiomatique que "ça fonctionne""
}
```

## Testing

Run the test in developer menu:
1. Go to DevMenu
2. Tap "Test des suggestions françaises"
3. Receive a notification with a language suggestion example

## Philosophy

This feature embodies the spirit of constructive language education - helping users improve their French through gentle, respectful suggestions while maintaining full functionality and user freedom.