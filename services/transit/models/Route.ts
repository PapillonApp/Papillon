import {Alerts} from "./Alerts";
import {Itineraries} from "./Itineraries";
import {Vehicle} from "./Vehicle";

export interface Route {
	alerts: Alerts;
	compact_display_short_name: {
		boxed_text: string;
		elements: (string | null)[];
		route_name_redundancy: boolean;
	};
	fares: never[];
	global_route_id: string;
	itineraries: Itineraries;
	mode_name: string;
	real_time_route_id: string;
	route_color: string;
	route_display_short_name: {
		boxed_text: string;
		elements: (string | null)[];
		route_name_redundancy: boolean;
	};
	route_image?: string;
	route_long_name: string;
	route_network_id: string;
	route_network_name: string;
	route_short_name: string;
	route_text_color: string;
	route_timezone: string;
	route_type: number;
	sorting_key: string;
	tts_long_name: string;
	tts_short_name: string;
	vehicle: Vehicle;
}