import type { AliseAccount } from "@/stores/account/types";
import type { BookingDay, BookingTerminal } from "../shared/Booking";

export const getBookings = async (account: AliseAccount, force = false): Promise<BookingTerminal[]> => {
  const bookings = force ? await account.authentication.session.getBookings() : await account.authentication.bookings;
  return [{
    id: "",
    terminalLabel: "Self",
    days: bookings.map((day) => ({
      id: (day.identifier ?? ""),
      canBook: day.canBook,
      date: day.date,
      booked: day.booked
    })),
    account: account
  }];
};

export const bookDay = async (account: AliseAccount, id: string, date: Date, booked: boolean): Promise<BookingDay> => {
  const bookedDay = await account.authentication.session.bookDay(id, 1, !booked);
  return {
    id: bookedDay.identifier ?? "",
    canBook: bookedDay.canBook,
    booked: bookedDay.booked,
  };
};