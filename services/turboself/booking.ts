import { Booking as TurboBooking, Client } from "turboself-api";

import { error } from "@/utils/logger/logger";

import { Booking, BookingDay } from "../shared/canteen";

export async function fetchTurboSelfBookingsWeek(session: Client, accountId: string, weekNumber: number): Promise<BookingDay[]> {
  const terminals = await session.getBookings(weekNumber);

  const mappedBookings = mapBookings(terminals, accountId)

  return mappedBookings
}

function mapBookings(data: TurboBooking[], accountId: string): BookingDay[] {
  const toReturn: Record<string, Booking[]> = {}
  for (const terminal of data) {
    for (const day of terminal.days) {
      const key = day.date.toISOString()
      toReturn[key] = toReturn[key] || [];
      toReturn[key].push({
        id: day.id,
        label: terminal.terminal.name,
        canBook: day.canBook,
        booked: day.booked,
        ref: day,
        createdByAccount: accountId
      })
    }
  }

  return Object.entries(toReturn).map(([day, bookings]) => ({
    date: new Date(new Date(day).setDate(new Date(day).getDate() - 1)),
    available: bookings
  }));
}

export async function setTurboSelfMealBookState(meal: Booking, booked?: boolean): Promise<Booking> {
  if (!meal.ref) {
    error("Invalid Meal Ref")
  }

  booked = booked ?? !meal.booked
  await meal.ref.book(booked ? 1 : 0)

  return {
    ...meal,
    booked: booked
  }
}