export interface TransitDepartures {
	arrival_time: number;
	departure_time: number;
	is_cancelled: boolean;
	is_real_time: boolean;
	rt_trip_id: string;
	scheduled_arrival_time: number;
	scheduled_departure_time: number;
	trip_search_key: string;
	wheelchair_accessible: number;
}