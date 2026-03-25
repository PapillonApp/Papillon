import {ItinerariesPlanDetails} from "./ItinerariesPlanDetails";
import {Stop} from "./Stop";

export interface Itineraries {
	branch_code: string;
	canonical_itinerary: number;
	direction_headsign: string;
	direction_id: number;
	headsign: string;
	is_active: boolean;
	merged_headsign: string;
	plan_details: ItinerariesPlanDetails;
	shape: string;
	stops: Stop[];
}