import type { PronoteAccount } from "@/stores/account/types";
import pronote from "pawnote";
import { Reconnected } from "../reload-account";

export const reloadInstance = async (authentication: PronoteAccount["authentication"]): Promise<Reconnected<PronoteAccount>> => {
  const session = pronote.createSessionHandle();
  const refresh = await pronote.loginToken(session, authentication);
  pronote.startPresenceInterval(session);

  return {
    instance: session,
    authentication: {
      ...authentication,
      ...refresh
    }
  };
};
