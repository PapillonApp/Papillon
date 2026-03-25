import {ArrivalSchedule} from "./ArrivalSchedule";
import {StopSchedule} from "./StopSchedule";

export interface PlanDetails {
	/** Arrival time of the vehicle used for the trip */
	arrival_schedule_item: ArrivalSchedule;
	/** Route ID on the GTFS Public */
	global_route_id: string;
	/** Itinerary ID used by Transit */
	internal_itinerary_id: string;
	/** Next arrival time of the vehicle */
	stop_schedule_items: StopSchedule[];
}