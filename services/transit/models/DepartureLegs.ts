import {PlanDetails} from "./PlanDetails";

export interface DepartureLegs {
	/** Vehicle departure date (with real-time data if available) */
	departure_time: number;
	/** Estimated arrival date of the vehicle (with real-time data if available) */
	arrival_time: number;
	/** Is this vehicle served? */
	is_cancelled: boolean;
	/** Does the vehicle support real-time schedules? */
	is_real_time: boolean;
	
	raw_trip_headsign?: string;
	raw_trip_short_name?: string;

	/** Id of the itinerary */
	rt_trip_id: string;
	/** Details of the transport */
	plan_details: PlanDetails;
	/** Vehicle departure times according to the schedule */
	scheduled_departure_time: number;
	/** Estimated arrival times according to the schedule */
	scheduled_arrival_time: number;
	/** Is the vehicule stop equipped to accommodate a person with a wheelchair?*/
	wheelchair_accessible: number;
	/** Trip search key on the GTFS Public */
	trip_search_key: string;
}