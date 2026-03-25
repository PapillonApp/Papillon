import {Station} from "./Station";

export interface Stop {
	city_name: string;
	global_stop_id: string;
	location_type: number;
	parent_station?: Station;
	parent_station_global_stop_id?: string;
	raw_stop_id: string;
	route_type: number;
	rt_stop_id: string;
	stop_code: string;
	stop_lat: number;
	stop_lon: number;
	stop_name: string;
	wheelchair_boarding: number;
}