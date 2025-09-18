
import { BookingDay as AliseBookingDay, Client } from "alise-api";
import { Booking, BookingDay as SharedBookingDay } from "../shared/canteen";

export async function fetchAliseBookingsWeek(session: Client, accountId: string, weekNumber: number): Promise<SharedBookingDay[]> {
  const bookings = await session.getBookings();
  const mapped: Record<string, Booking[]> = {};
  for (const booking of bookings) {
    if (!booking.date) continue;
    const key = booking.date.toISOString();
    mapped[key] = mapped[key] || [];
    mapped[key].push({
      id: booking.identifier ?? key,
      label: booking.booked ? "Réservé" : "Disponible",
      canBook: booking.canBook,
      booked: booking.booked,
      ref: booking,
      createdByAccount: accountId
    });
  }
  return Object.entries(mapped).map(([date, available]) => ({
    date: new Date(date),
    available
  }));
}

export async function setAliseMealBookState(meal: Booking, booked?: boolean): Promise<Booking> {
  if (!meal.ref) throw new Error("Invalid Meal Ref");
  booked = booked ?? !meal.booked;
  await meal.ref.book(booked ? 1 : 0);
  return { ...meal, booked };
}
