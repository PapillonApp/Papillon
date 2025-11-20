// services/lannion/refresh.ts
import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";
import { error } from "@/utils/logger/logger";

import { loginAndFetchLannionData } from "./module/api";

export interface LannionSession {
  userInfo: any;
  grades: any | null;
}

export async function refreshLannionAccount(
  accountId: string,
  credentials: Auth
): Promise<{ auth: Auth; session: LannionSession }> {
  const username = String(credentials.additionals?.["username"] || "");
  const password = String(credentials.additionals?.["password"] || "");

  if (!username || !password) {
    error(
      "Lannion: username/password manquants dans credentials.",
      "Lannion.refresh"
    );
    throw new Error("Identifiants Lannion manquants (username/password).");
  }

  const { userInfo, grades } = await loginAndFetchLannionData(
    username,
    password
  );

  const authData: Auth = {
    ...credentials,
    additionals: {
      ...credentials.additionals,
      username,
      password,
    },
  };

  useAccountStore.getState().updateServiceAuthData(accountId, authData);

  const session: LannionSession = {
    userInfo,
    grades,
  };

  return { auth: authData, session };
}
