export interface ArrivalSchedule {
	/** Vehicle departure date (with real-time data if available) */
	departure_time: number;
	/** Estimated arrival date of the vehicle (with real-time data if available) */
	arrival_time: number;
	/** Is this vehicle served? */
	is_cancelled: boolean;
	/** Does the vehicle support real-time schedules? */
	is_real_time: boolean;
	/** Vehicle departure times according to the schedule */
	scheduled_departure_time: number;
	/** Estimated arrival times according to the schedule */
	scheduled_arrival_time: number;
	/** Is the vehicule stop equipped to accommodate a person with a wheelchair?*/
	wheelchair_accessible: number;
}