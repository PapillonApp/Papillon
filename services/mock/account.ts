import { Href, router } from "expo-router";
import { Alert } from "react-native";

import { initializeAccountManager } from "@/services/shared";
import { useAccountStore } from "@/stores/account";
import { Account, ServiceAccount, Services } from "@/stores/account/types";
import uuid from "@/utils/uuid/uuid";

const createMockService = (): ServiceAccount => {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    serviceId: Services.MOCK_DATA,
    auth: {},
    createdAt: now,
    updatedAt: now,
  };
};

const finishMockAccountSetup = async (accountId: string) => {
  useAccountStore.getState().setLastUsedAccount(accountId);
  await initializeAccountManager(accountId);
  router.dismissAll();
  router.replace("/" as Href);
};

const runMockSetup = (action: () => Promise<unknown>) => {
  void action().catch(cause => {
    Alert.alert(
      "Erreur Mock Data",
      `Impossible de préparer le compte fictif : ${String(cause)}`
    );
  });
};

export async function createMockProfile(): Promise<Account> {
  const store = useAccountStore.getState();
  const existing = store.accounts.find(
    account =>
      account.firstName === "Camille" &&
      account.lastName === "Martin" &&
      account.services.some(service => service.serviceId === Services.MOCK_DATA)
  );

  if (existing) {
    await finishMockAccountSetup(existing.id);
    return existing;
  }

  const now = new Date().toISOString();
  const account: Account = {
    id: uuid(),
    firstName: "Camille",
    lastName: "Martin",
    schoolName: "Lycée Victor-Hugo",
    className: "Seconde 2",
    customisation: { profilePicture: "", subjects: {} },
    services: [createMockService()],
    createdAt: now,
    updatedAt: now,
  };
  store.addAccount(account);
  await finishMockAccountSetup(account.id);
  return account;
}

export async function attachMockDataToCurrentAccount(): Promise<Account> {
  const store = useAccountStore.getState();
  const account = store.accounts.find(
    item => item.id === store.lastUsedAccount
  );
  if (!account) {
    return createMockProfile();
  }

  if (
    !account.services.some(service => service.serviceId === Services.MOCK_DATA)
  ) {
    store.addServiceToAccount(account.id, createMockService());
  }

  const updatedAccount =
    useAccountStore.getState().accounts.find(item => item.id === account.id) ??
    account;
  await finishMockAccountSetup(updatedAccount.id);
  return updatedAccount;
}

export function openMockDataAccountChooser(): void {
  const store = useAccountStore.getState();
  const currentAccount = store.accounts.find(
    account => account.id === store.lastUsedAccount
  );

  if (!currentAccount) {
    runMockSetup(createMockProfile);
    return;
  }

  if (
    currentAccount.services.some(
      service => service.serviceId === Services.MOCK_DATA
    )
  ) {
    Alert.alert(
      "Mock Data",
      "Le service Mock Data est déjà associé au compte actuel.",
      [
        {
          text: "Continuer",
          onPress: () =>
            runMockSetup(() => finishMockAccountSetup(currentAccount.id)),
        },
      ]
    );
    return;
  }

  Alert.alert(
    "Ajouter Mock Data",
    "Comment souhaites-tu utiliser les données fictives ?",
    [
      { text: "Annuler", style: "cancel" },
      {
        text: "Nouveau profil",
        onPress: () => runMockSetup(createMockProfile),
      },
      {
        text: "Compte actuel",
        onPress: () => runMockSetup(attachMockDataToCurrentAccount),
      },
    ]
  );
}
