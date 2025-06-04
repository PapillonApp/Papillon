import type { PronoteAccount } from "@/stores/account/types";
import pronote from "pawnote";
import { Reconnected } from "../reload-account";

export const reloadInstance = async (authentication: PronoteAccount["authentication"]): Promise<Reconnected<PronoteAccount>> => {
  const session = pronote.createSessionHandle();
  const tokens = [authentication.token, ...(authentication.oldTokens || [])];
  let refresh: pronote.RefreshInformation | undefined;
  let lastError: unknown = null;

  for (const token of tokens) {
    try {
      refresh = await pronote.loginToken(session, { ...authentication, token });
      break;
    } catch (err) {
      lastError = err;
    }
  }

  if (!refresh) {
    throw lastError || pronote.AuthenticateError;
  }

  pronote.startPresenceInterval(session);

  const uniqueTokens = Array.from(new Set([refresh.token, ...tokens]));

  return {
    instance: session,
    authentication: {
      ...authentication,
      ...refresh,
      oldTokens: uniqueTokens
    }
  };
};
