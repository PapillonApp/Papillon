import { GenericInterface } from "./types";

export interface Balance extends GenericInterface {
	amount: number;
	currency: string;
	lunchRemaining: number;
	lunchPrice: number;
	label: string
}