import React, { useState } from "react";
import type { Screen } from "@/router/helpers/types";

import pronote from "pawnote";
import uuid from "@/utils/uuid-v4";

import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService, PronoteAccount } from "@/stores/account/types";
import defaultPersonalization from "@/services/pronote/default-personalization";
import LoginView from "@/components/Templates/LoginView";
import extract_pronote_name from "@/utils/format/extract_pronote_name";

const PronoteCredentials: Screen<"PronoteCredentials"> = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStoredAccount = useAccounts(store => store.create);
  const switchTo = useCurrentAccount(store => store.switchTo);

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const accountID = uuid();

      const session = pronote.createSessionHandle();
      const refresh = await pronote.loginCredentials(session, {
        url: route.params.instanceURL,
        kind: pronote.AccountKind.STUDENT,
        username,
        password,
        deviceUUID: accountID
      }).catch((error) => {
        if (error instanceof pronote.SecurityError && !error.handle.shouldCustomPassword && !error.handle.shouldCustomDoubleAuth) {
          navigation.navigate("Pronote2FA_Auth", {
            session,
            error,
            accountID
          });
        } else {
          throw error;
        }
      });

      if (!refresh) throw pronote.AuthenticateError;

      const user = session.user.resources[0];
      const name = user.name;

      const account: PronoteAccount = {
        instance: session,

        localID: accountID,
        service: AccountService.Pronote,

        isExternal: false,
        linkedExternalLocalIDs: [],

        name,
        className: user.className,
        schoolName: user.establishmentName,
        studentName: {
          first: extract_pronote_name(name).givenName,
          last: extract_pronote_name(name).familyName
        },

        authentication: { ...refresh, deviceUUID: accountID },
        personalization: await defaultPersonalization(session),

        identity: {},
        serviceData: {},
        providers: []
      };

      pronote.startPresenceInterval(session);
      createStoredAccount(account);
      setLoading(false);
      switchTo(account);

      // We need to wait a tick to make sure the account is set before navigating.
      queueMicrotask(() => {
        // Reset the navigation stack to the "Home" screen.
        // Prevents the user from going back to the login screen.
        navigation.reset({
          index: 0,
          routes: [{ name: "AccountCreated" }],
        });
      });
    }
    catch (error) {
      setLoading(false);

      if (error instanceof Error) {
        switch (error.name) {
          case "BadCredentialsError":
            setError("Nom d'utilisateur ou mot de passe incorrect");
            break;
          case "AuthenticateError":
            setError("Impossible de s'authentifier : " + error.message);
            break;
          case "AccessDeniedError":
            setError("Tu n'es pas autorisé à te connecter à cet établissement");
            break;
          case "AccountDisabledError":
            setError("Ton compte a été désactivé. Contacte ton établissement.");
            break;
          default:
            setError(error.message);
            break;
        }
      }
      else {
        setError("Erreur inconnue");
      }
    }
  };

  return (
    <LoginView
      serviceIcon={require("@/../assets/images/service_pronote.png")}
      serviceName="Pronote"
      onLogin={(username, password) => handleLogin(username, password)}
      loading={loading}
      error={error}
    />
  );
};

export default PronoteCredentials;
