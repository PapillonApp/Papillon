import {DepartureLegs} from "./DepartureLegs";
import {Route} from "./Route";

interface BaseRouteLegs {
	/** Estimated time for this portion of the trip */
	duration: number;
	/** Date of departure from the departure point */
	start_time: number;
	/** Estimated time of arrival at the destination */
	end_time: number;
}

interface WalkRouteLegs extends BaseRouteLegs {
	/** Action taken by the traveler during this part of the trip */
	leg_mode: "walk";
	/** Distance traveled */
	distance: number;
	/** List of points where line segments are drawn between consecutive points */
	polyline: string;
}

interface TransitRouteLegs extends BaseRouteLegs {
	/** Action taken by the traveler during this part of the trip */
	leg_mode: "transit";
	departures: DepartureLegs;
	routes: Route[];
}

export type RouteLegs = WalkRouteLegs | TransitRouteLegs;