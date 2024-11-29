import { useState } from "react";
import {Authenticator, Client, getOnlinePayments} from "pawrd";
import { AccountService, type ARDAccount } from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import LoginView from "@/components/Templates/LoginView";
import { Screen } from "@/router/helpers/types";

export async function detectMealPrice (account: Client): Promise<number | null> {
  const uid = await account.getOnlinePayments().then((payment) => payment.user.uid);
  const consumptionsHistory = await account.getConsumptionsHistory(uid);

  let mostFrequentAmount: number | null = null;
  let maxCount = 0;
  const amountCount: Record<number, number> = {};

  for (const consumption of consumptionsHistory) {
    const amount = consumption.amount;

    amountCount[amount] = (amountCount[amount] || 0) + 1;

    if (amountCount[amount] > maxCount) {
      maxCount = amountCount[amount];
      mostFrequentAmount = amount;
    }
  }

  return mostFrequentAmount || null;
}

const ExternalArdLogin: Screen<"ExternalArdLogin"> = ({ navigation }) => {
  const linkExistingExternalAccount = useCurrentAccount(store => store.linkExistingExternalAccount);
  const create = useAccounts(store => store.create);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (username: string, password: string, customFields: Record<string, string>): Promise<void> => {
    try {
      const authenticator = new Authenticator();
      const schoolID = customFields["schoolID"];

      const client = await authenticator.fromCredentials(schoolID, username, password);
      const mealPrice = await detectMealPrice(client);

      const new_account: ARDAccount = {
        instance: client,
        service: AccountService.ARD,
        username,
        authentication: {
          schoolID,
          username,
          password,
          pid: client.pid,
          mealPrice: mealPrice ?? 100
        },
        isExternal: true,
        localID: uuid(),
        data: {}
      };

      create(new_account);
      linkExistingExternalAccount(new_account);
      if (!mealPrice) return navigation.navigate("PriceError", { account: client, accountId: new_account.localID });
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
      serviceIcon={require("@/../assets/images/service_ard.png")}
      serviceName="ARD"
      onLogin={(username, password, customFields) => handleLogin(username, password, customFields)}
      loading={loading}
      error={error}
      customFields={[{
        identifier: "schoolID",
        title: "Identifiant de l'établissement",
        placeholder: "Identifiant de l'établissement",
        secureTextEntry: false
      }]}
    />
  );
};

export default ExternalArdLogin;
