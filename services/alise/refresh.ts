import { authenticateWithCredentials, Client } from "alise-api";

import { runAuthRefresh } from "@/services/auth/coordinator";
import { Auth } from "@/stores/account/types";

export function refreshAliseAccount(accountId: string, credentials: Auth): Promise<{auth: Auth, session: Client}> {
  return runAuthRefresh(accountId, credentials, { rotatesCredential: false }, async tracker => {
    try {
      const stored = tracker.readCredentials();
      const username = String(stored.additionals?.["username"] ?? "");
      const password = String(stored.additionals?.["password"] ?? "");
      const site = String(stored.additionals?.["site"] ?? "");

      if (!username || !password || !site) {
        throw new Error("Identifiants manquants pour l'authentification Alise");
      }

      tracker.credentialSent(stored);
      const session = await authenticateWithCredentials(username, password, site);

      if (!session) {
        throw new Error("Échec de l'authentification Alise - session invalide");
      }

      if (!session.account) {
        throw new Error("Authentification Alise réussie mais données de compte manquantes");
      }

      return { auth: stored, session };
    } catch (error) {
      console.error("Erreur lors du refresh du compte Alise:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Échec du refresh Alise: ${errorMessage}`);
    }
  });
}
