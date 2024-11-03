import type { MultiAccount } from "@/stores/account/types";
import type { Reconnected } from "../reload-account";
import { authWithRefreshToken } from "esup-multi.js";

export const reloadInstance = async (authentication: MultiAccount["authentication"]): Promise<Reconnected<MultiAccount>> => {
  const session = await authWithRefreshToken(authentication.instanceURL, { refreshAuthToken: authentication.refreshAuthToken });

  return {
    instance: session,
    authentication: {
      instanceURL: authentication.instanceURL,
      refreshAuthToken: session.userData.refreshAuthToken || ""
    }
  };
};
