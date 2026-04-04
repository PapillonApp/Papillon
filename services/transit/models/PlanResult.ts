import {RouteLegs} from "./RouteLegs";

export interface PlanResult {
	accessibility: string;
	duration: number;
	start_time: string;
	end_time: string;
	legs: RouteLegs[];
	fare?: never;
}