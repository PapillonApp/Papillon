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
    throw new Error("Missing ARD credentials");
  }

  const authenticator = new Authenticator();
  const client = await authenticator.fromCredentials(
    schoolId,
    username,
    password
  );

  // Debug: inspecter la structure du client
  console.log("Structure du client ARD:");
  console.log("Keys:", Object.keys(client));
  console.log("Client properties:", {
    uid: (client as any).uid,
    userUid: (client as any).userUid,
    fe_uid: (client as any).fe_uid,
    cookies: (client as any).cookies?.length || 0,
  });

  return { auth: credentials, session: client };
}
