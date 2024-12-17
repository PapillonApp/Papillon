import { useState } from "react";
import LoginView from "@/components/Templates/LoginView";
import { Screen } from "@/router/helpers/types";
import { authenticateWithCredentials, Client } from "alise-api";
import { AccountService, AliseAccount } from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import { useAccounts, useCurrentAccount } from "@/stores/account";

async function detectMealPrice (account: Client): Promise<number | null> {
  const history = await account.getFinancialHistory();

  let mostFrequentAmount: number | null = null;
  let maxCount = 0;
  const amountCount: Record<number, number> = {};

  for (const consumption of history) {
    const amount = consumption.amount;

    amountCount[amount] = (amountCount[amount] || 0) + 1;

    if (amountCount[amount] > maxCount) {
      maxCount = amountCount[amount];
      mostFrequentAmount = amount;
    }
  }

  return -mostFrequentAmount! || null;
}

const ExternalAliseLogin: Screen<"ExternalAliseLogin"> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const linkExistingExternalAccount = useCurrentAccount(store => store.linkExistingExternalAccount);
  const create = useAccounts(store => store.create);

  const handleLogin = async (username: string, password: string, customFields: Record<string, string>): Promise<void> => {
    setLoading(true);

    try {
      const session = await authenticateWithCredentials(username, password, customFields["schoolID"]);
      const mealPrice = await detectMealPrice(session) ?? 100;
      const schoolID = customFields["schoolID"];
      const bookings = await session.getBookings();
      const new_account: AliseAccount = {
        instance: undefined,
        service: AccountService.Alise,
        username,
        authentication: {
          session, username, password, schoolID, mealPrice, bookings
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
      serviceIcon={require("@/../assets/images/service_alise.png")}
      serviceName="Alise"
      onLogin={(username, password, customFields) => handleLogin(username, password, customFields)}
      loading={loading}
      error={error}
      usernamePlaceholder="Identifiant ou adresse e-mail"
      passwordLabel="Mot de passe"
      passwordPlaceholder="Mot de passe"
      customFields={[{
        identifier: "schoolID",
        title: "Identifiant de l'établissement",
        placeholder: "aes00000",
        secureTextEntry: false
      }]}
    />
  );
};

export default ExternalAliseLogin;
