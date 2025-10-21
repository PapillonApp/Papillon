import { authenticateWithCredentials, Client } from "alise-api";

import { Auth } from "@/stores/account/types";

import { extractAliseSiteId } from "./extract-site-id";

export async function refreshAliseAccount(accountId: string, credentials: Auth): Promise<{ auth: Auth, session: Client }> {
  try {
    console.log("🔍 Credentials reçus:", JSON.stringify(credentials, null, 2));

    const username = String(credentials.additionals?.["username"] ?? "");
    const password = String(credentials.additionals?.["password"] ?? "");
    const siteInput = String(credentials.additionals?.["site"] ?? "");

    console.log("📝 Username:", username);
    console.log("📝 Password:", password ? "***" : "(vide)");
    console.log("📝 Site input:", siteInput);

    if (!username || !password || !siteInput) {
      throw new Error("Identifiants manquants pour l'authentification Alise");
    }

    // Extrait l'identifiant du site depuis l'URL ou utilise directement l'identifiant
    console.log("🔄 Extraction du site ID...");
    const site = extractAliseSiteId(siteInput);
    console.log("✅ Site extrait:", site);

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