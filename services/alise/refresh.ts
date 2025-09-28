import { authenticateWithCredentials, Client } from "alise-api";
import { Auth } from "@/stores/account/types";

export async function refreshAliseAccount(accountId: string, credentials: Auth): Promise<{auth: Auth, session: Client}> {
  try {
    const username = String(credentials.additionals?.["username"] ?? "");
    const password = String(credentials.additionals?.["password"] ?? "");
    const site = String(credentials.additionals?.["site"] ?? "");
    
    if (!username || !password || !site) {
      throw new Error("Identifiants manquants pour l'authentification Alise");
    }
    
    const session = await authenticateWithCredentials(username, password, site);
    
    if (!session) {
      throw new Error("Échec de l'authentification Alise - session invalide");
    }
    
    if (!session.account) {
      throw new Error("Authentification Alise réussie mais données de compte manquantes");
    }
    
    return { auth: credentials, session };
  } catch (error) {
    console.error("Erreur lors du refresh du compte Alise:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Échec du refresh Alise: ${errorMessage}`);
  }
}
