import { useState } from "react";
import { authenticateWithCredentials } from "turboself-api";
import { AccountService, TurboselfAccount } from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import LoginView from "@/components/Templates/LoginView";
import { Screen } from "@/router/helpers/types";

const ExternalTurboselfLogin: Screen<"ExternalTurboselfLogin"> = ({ navigation }) => {
  const linkExistingExternalAccount = useCurrentAccount(store => store.linkExistingExternalAccount);
  const create = useAccounts(store => store.create);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (username: string, password: string): Promise<void> => {
    setLoading(true);

    try {
      const session = await authenticateWithCredentials(username, password);

      const new_account: TurboselfAccount = {
        instance: undefined,
        service: AccountService.Turboself,
        username,
        authentication: {
          session, username, password
        },
        isExternal: true,
        localID: uuid(),
        data: {}
      };

      create(new_account);
      linkExistingExternalAccount(new_account);

      navigation.pop();
      navigation.pop();
      navigation.pop();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      else {
        setError("Une erreur est survenue lors de la connexion.");
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <LoginView
      serviceIcon={require("@/../assets/images/service_turboself.png")}
      serviceName="Turboself"
      onLogin={(username, password) => handleLogin(username, password)}
      loading={loading}
      error={error}
    />
  );
};

export default ExternalTurboselfLogin;
