import { Auth } from "@/stores/account/types";
import { Authenticator, Client } from "pawrd";
import { error } from "@/utils/logger/logger";

export async function refreshArdAccount(
  accountId: string,
  credentials: Auth
): Promise<{ auth: Auth; session: Client }> {
  const username = String(credentials.additionals?.username ?? "");
  const password = String(credentials.additionals?.password ?? "");
  const schoolId = String(
    credentials.additionals?.schoolId ??
      credentials.additionals?.establishment ??
      ""
  );

  if (!username || !password || !schoolId) {
    error(
      "Identifiants ARD incomplets (username/password/schoolId)",
      "refreshArdAccount"
    );
  }

  const authenticator = new Authenticator();
  const client = await authenticator.fromCredentials(
    schoolId,
    username,
    password
  );
	
  return { auth: credentials, session: client };
}
