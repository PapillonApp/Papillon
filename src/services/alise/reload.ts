import type { AliseAccount } from "@/stores/account/types";
import { authenticateWithCredentials } from "alise-api";

export const reload = async (account: AliseAccount): Promise<AliseAccount["authentication"]> => {
  const auth = { ...account.authentication };
  const session = await authenticateWithCredentials(auth.username, auth.password, auth.schoolID);
  const bookings = await session.getBookings();
  return {
    session,
    schoolID: auth.schoolID,
    username: auth.username,
    password: auth.password,
    mealPrice: auth.mealPrice,
    bookings: bookings
  };
};
