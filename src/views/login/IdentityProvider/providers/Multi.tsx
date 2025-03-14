import React, { useState } from "react";
import type { Screen } from "@/router/helpers/types";

import { authWithCredentials } from "esup-multi.js";
import uuid from "@/utils/uuid-v4";

import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService, type MultiAccount } from "@/stores/account/types";
import defaultPersonalization from "@/services/multi/default-personalization";
import LoginView from "@/components/Templates/LoginView";

const Muli_Login: Screen<"Multi_Login"> = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStoredAccount = useAccounts(store => store.create);
  const switchTo = useCurrentAccount(store => store.switchTo);

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const account = await authWithCredentials(route.params.instanceURL, { username, password });

      const local_account: MultiAccount = {
        instance: undefined,

        localID: uuid(),
        service: AccountService.Multi,

        isExternal: false,
        linkedExternalLocalIDs: [],

        identity: {
          firstName: account.userData.firstname,
          lastName: account.userData.name,
          ine: account.userData.ine,
          birthDate: account.userData.birthDate ? new Date(account.userData.birthDate) : undefined,
          email: [account.userData.email],
        },

        name: account.userData.name + " " + account.userData.firstname,
        studentName: {
          last: account.userData.name,
          first: account.userData.firstname
        },
        className: "", // TODO ?
        schoolName: route.params.title,

        authentication: {
          instanceURL: route.params.instanceURL,
          refreshAuthToken: account.userData.refreshAuthToken || "",
        },
        personalization: await defaultPersonalization(account),
        serviceData: {},
        providers: []
      };

      createStoredAccount(local_account);
      setLoading(false);
      switchTo(local_account);

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
      if (error instanceof Error) {
        setError(error.message);
      }
      else {
        setError("Erreur inconnue");
      }

      setLoading(false);
      console.error(error);
    }
  };

  return (
    <LoginView
      serviceIcon={route.params.image}
      serviceName={route.params.title}
      loading={loading}
      error={error}
      onLogin={(username, password) => handleLogin(username, password)}
    />
  );
};

export default Muli_Login;
