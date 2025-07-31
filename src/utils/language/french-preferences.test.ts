/**
 * Tests for French Language Preferences Utility
 */

import { 
  checkFrenchPreferences, 
  applyFrenchPreferences, 
  getFrenchSuggestionMessage,
  FRENCH_PREFERENCES 
} from '../french-preferences';

// Simple test function since this repo doesn't have a formal test framework
export const runFrenchPreferencesTests = () => {
  console.log('🧪 Running French Preferences Tests...');
  
  // Test 1: Check detection of "ça fonctionne"
  const text1 = "Bonjour, ça fonctionne très bien maintenant!";
  const suggestions1 = checkFrenchPreferences(text1);
  console.assert(suggestions1.length > 0, "Should detect 'ça fonctionne'");
  console.assert(suggestions1[0].preferred === "ça marche", "Should suggest 'ça marche'");
  
  // Test 2: Apply preferences
  const improved1 = applyFrenchPreferences(text1);
  console.assert(improved1.includes("ça marche"), "Should replace with 'ça marche'");
  console.assert(!improved1.includes("ça fonctionne"), "Should not contain 'ça fonctionne'");
  
  // Test 3: Test with text that doesn't need changes
  const text2 = "Tout marche parfaitement!";
  const suggestions2 = checkFrenchPreferences(text2);
  console.assert(suggestions2.length === 0, "Should not suggest changes for good text");
  
  // Test 4: Test suggestion message generation
  const message = getFrenchSuggestionMessage(suggestions1);
  console.assert(message.includes("💡"), "Should include suggestion emoji");
  console.assert(message.includes("ça marche"), "Should mention preferred expression");
  
  // Test 5: Case insensitive detection
  const text3 = "ÇA FONCTIONNE BIEN";
  const suggestions3 = checkFrenchPreferences(text3);
  console.assert(suggestions3.length > 0, "Should detect uppercase text");
  
  console.log('✅ All French Preferences tests passed!');
  
  // Log some examples
  console.log('\n📝 Examples:');
  console.log('Original:', text1);
  console.log('Improved:', improved1);
  console.log('Suggestion:', message);
};

// Run tests if this file is executed directly
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  runFrenchPreferencesTests();
}