import React, { useState } from "react";
import type { Screen } from "@/router/helpers/types";

import { authWithCredentials } from "uphf-api";
import uuid from "@/utils/uuid-v4";

import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService, type UphfAccount } from "@/stores/account/types";
import defaultPersonalization from "@/services/uphf/default-personalization";
import LoginView from "@/components/Templates/LoginView";

const UnivUphf_Login: Screen<"UnivUphf_Login"> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStoredAccount = useAccounts(store => store.create);
  const switchTo = useCurrentAccount(store => store.switchTo);

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const account = await authWithCredentials({ username, password });

      const local_account: UphfAccount = {
        instance: undefined,

        localID: uuid(),
        service: AccountService.UPHF,

        isExternal: false,
        linkedExternalLocalIDs: [],

        name: account.userData.name + " " + account.userData.firstname,
        studentName: {
          last: account.userData.name,
          first: account.userData.firstname
        },
        className: "", // TODO ?
        schoolName: "Université Polytechnique Hauts-de-France",

        authentication: {
          refreshAuthToken: account.userData.refreshAuthToken,
        },
        personalization: await defaultPersonalization(account),
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
    <>
      <LoginView
        serviceIcon={require("@/../assets/images/service_uphf.png")}
        serviceName="Université Polytechnique Hauts-de-France"
        loading={loading}
        error={error}
        onLogin={(username, password) => handleLogin(username, password)}
      />
    </>
  );
};

export default UnivUphf_Login;
