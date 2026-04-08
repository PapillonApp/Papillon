import {Period} from "./Period";

export interface Alerts {
	/** When the alert is visible */
	active_periods: Period[];
	/** When the alerts has been published */
	created_at: number;

	description: string;
	effect: "REDUCED_SERVICE" | "NO_SERVICE" | string;
	informed_entities: {
		global_route_id: string;
		global_stop_id: string;
	}[];
	severity: "Warning" | "Severe" | string;
	title: string;
}