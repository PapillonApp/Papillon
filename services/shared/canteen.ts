import { BookingDay as TurboBookingDay } from "turboself-api";

import { GenericInterface } from "./types";

export interface CanteenMenu extends GenericInterface {
  date: Date;
  lunch?: Meal;
  dinner?: Meal;
}

export interface Meal {
  entry: Food[];
  main?: Food[];
  side?: Food[];
  cheese?: Food[];
  dessert?: Food[];
  drink?: Food[];
}

export interface Food {
  name: string;
  allergens?: string[];
}

export interface CanteenHistoryItem extends GenericInterface {
  date: Date;
  label: string;
  currency: string;
  amount: number;
}

export interface QRCode extends GenericInterface {
	type: QRType,
	data: string
}

export enum QRType {
	QRCode,
	Barcode
}

export interface BookingDay {
	date: Date,
	available: Booking[]
}

export interface Booking extends GenericInterface  {
	id: string,
	label: string,
	canBook: boolean,
	booked: boolean,
	ref?: TurboBookingDay
}

export enum CanteenKind {
  FORFAIT,
  ARGENT
}