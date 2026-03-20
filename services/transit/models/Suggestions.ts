import { PlaceSuggestion } from "@/services/transit/models/PlaceSuggestion";
import { Stop } from "@/services/transit/models/Stop";

export interface Suggestions {
  places: PlaceSuggestion;
  stops: Stop;
}