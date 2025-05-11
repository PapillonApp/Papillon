import React, { useState } from "react";
import type { Screen } from "@/router/helpers/types";

import { login } from "appscho";
import uuid from "@/utils/uuid-v4";

import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService, type AppschoAccount} from "@/stores/account/types";
import defaultPersonalization from "@/services/appscho/default-personalization";
import LoginView from "@/components/Templates/LoginView";

const Appscho_Login: Screen<"Appscho_Login"> = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStoredAccount = useAccounts(store => store.create);
  const switchTo = useCurrentAccount(store => store.switchTo);

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);


      const account = await login(route.params.instanceURL,  username, password );

      const local_account: AppschoAccount = {
        instance: {},

        localID: uuid(),
        service: AccountService.Appscho,

        isExternal: false,
        linkedExternalLocalIDs: [],

        identity: {
          firstName: account.firstname,
          lastName: account.lastname,
          ine: "",
          birthDate:  undefined,
          email: [""],
        },

        name: account.lastname + " " + account.firstname,
        studentName: {
          last: account.lastname,
          first: account.firstname
        },
        className: "", // TODO ?
        schoolName: route.params.title,

        credentials: {
          username: username,
          password: btoa(password)
        },

        authentication: {
          instanceAppscho: route.params.instanceURL,
          token: account.token || ""
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
      console.log(error);
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
        serviceIcon={route.params.image}
        serviceName={route.params.title}
        loading={loading}
        error={error}
        onLogin={(username, password) => handleLogin(username, password)}
      />
    </>
  );
};

export default Appscho_Login;
