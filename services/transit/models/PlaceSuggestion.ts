import { MatchedSubstring } from "@/services/transit/models/MatchedSubstring";

export interface PlaceSuggestion {
  description: string;
  matched_substrings: MatchedSubstring[];
  place_id: string;
  reference: string;
  structured_formatting: {
    main_text: string;
    main_text_matched_substrings: MatchedSubstring[];
    secondary_text: string;
  };
  terms: { offset: number; value: string }[];
  types: string[];
}