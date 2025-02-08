import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import pronote from "pawnote";

import {
  AccountsStore,
  CurrentAccountStore,
  Account,
  AccountService,
  ExternalAccount,
  PrimaryAccount
} from "@/stores/account/types";
import { reload } from "@/services/reload-account";
import { useTimetableStore } from "../timetable";
import { useHomeworkStore } from "../homework";
import { useGradesStore } from "../grades";
import { useNewsStore } from "../news";
import { useAttendanceStore } from "../attendance";
import { info, log } from "@/utils/logger/logger";

/**
 * Store for the currently selected account.
 * Not persisted, as it's only used during the app's runtime.
 */
export const useCurrentAccount = create<CurrentAccountStore>()((set, get) => ({
  account: null,
  linkedAccounts: [],

  mutateProperty: <T extends keyof PrimaryAccount>(key: T, value: PrimaryAccount[T]) => {
    log(`mutate property ${key} in storage`, "current:update");

    // Since "instance" is a runtime only key,
    // we mutate the property only in this memory store and not in the persisted one.
    if (key === "instance") {
      set((state) => {
        if (!state.account) return state;

        const account: Account = {
          ...state.account,
          [key]: value // `key` will always be "instance" but TypeScript complains otherwise.
        };

        return { account };
      });
    }
    else {
      const account = useAccounts.getState().update(
        get().account?.localID ?? "",
        key, value
      );

      set({ account: {
        ...account,
        // @ts-expect-error : types are conflicting between services.
        instance: get().account?.instance
      } });
    }

    log(`done mutating property ${key} in storage`, "[current:update]");
  },

  switchTo: async (account) => {
    log(`reading ${account.name}`, "switchTo");
    set({ account });
    useAccounts.setState({ lastOpenedAccountID: account.localID });

    // Rehydrate every store that needs it.
    await Promise.all([
      [useTimetableStore, "timetable"] as const,
      [useHomeworkStore, "homework"] as const,
      [useGradesStore, "grades"] as const,
      [useNewsStore, "news"] as const,
      [useAttendanceStore, "attendance"] as const,
    ].map(([store, storageName]) => {
      store.persist.setOptions({
        name: `${account.localID}-${storageName}-storage`
      });

      info(`rehydrating ${storageName}`, "switchTo");
      return store.persist.rehydrate();
    }));

    // Account is currently not authenticated,
    if (typeof account.instance === "undefined") {
      log("instance undefined, reloading...", "switchTo");
      // Automatically reconnect the main instance.
      const { instance, authentication } = await reload(account);
      get().mutateProperty("authentication", authentication);
      get().mutateProperty("instance", instance);
      log("instance reload done !", "switchTo");
    }

    const accounts = useAccounts.getState().accounts;
    const linkedAccounts = account.linkedExternalLocalIDs.map((linkedID) => {
      return {...accounts.find((acc) => acc.localID === linkedID)};
    }).filter(Boolean) as ExternalAccount[] ?? [];

    info(`found ${linkedAccounts.length} external accounts`, "switchTo");

    for (const linkedAccount of linkedAccounts) {
      const { instance, authentication } = await reload(linkedAccount);
      linkedAccount.instance = instance;
      linkedAccount.authentication = authentication;
      log("reloaded external", "switchTo");
    }

    log("reloaded all external accounts", "switchTo");

    set({ linkedAccounts });
    log(`done reading ${account.name} and rehydrating stores.`, "switchTo");
  },

  linkExistingExternalAccount: (account) => {
    log("linking", "linkExistingExternalAccount");

    set((state) => ({
      linkedAccounts: [...state.linkedAccounts, account]
    }));

    get().mutateProperty("linkedExternalLocalIDs", [
      ...get().account?.linkedExternalLocalIDs ?? [],
      account.localID
    ]);

    log("linked", "linkExistingExternalAccount");
  },

  logout: () => {
    const account = get().account;
    log(`logging out ${account?.name}`, "current:logout");

    // When using PRONOTE, we should make sure to stop the background interval.
    if (account && account.service === AccountService.Pronote && account.instance) {
      pronote.clearPresenceInterval(account.instance);
      log("stopped pronote presence", "current:logout");
    }

    set({ account: null, linkedAccounts: [] });
    useAccounts.setState({ lastOpenedAccountID: null });
  }
}));

/**
 * Store for the stored accounts.
 * Persisted, as we want to keep the accounts between app restarts.
 */
export const useAccounts = create<AccountsStore>()(
  persist(
    (set, get) => ({
      // When opening the app for the first time, it's null.
      lastOpenedAccountID: null as (string | null),

      // We don't need to store the localID here, as we can get it from the account store.
      accounts: <Array<Account>>[],

      // When creating, we don't want the "instance" to be stored.
      create: ({ instance, ...account }) => {
        log(`storing ${account.localID} (${"name" in account ? account.name : "no name"})`, "accounts:create");

        set((state) => ({
          accounts: [...state.accounts, account as Account]
        }));

        log(`stored ${account.localID}`, "accounts:create");
      },

      remove: (localID) => {
        log(`removing ${localID}`, "accounts:remove");

        set((state) => ({
          accounts: state.accounts.filter(
            (account) => account.localID !== localID
          )
        }));

        log(`removed ${localID}`, "accounts:remove");
      },

      /**
       * Mutates a given property for a given account
       * and return the updated account.
       */
      update: (localID, key, value) => {
        // Find the account to update in the storage.
        const account = get().accounts.find((account) => account.localID === localID);
        if (!account) return null;

        // Return as is: we should never update the store for "instance" key,
        // it should remain a runtime only property.
        if (key === "instance") return account;

        let accountMutated: Account;

        // Mutate only modified properties.
        if ((key as keyof PrimaryAccount) === "personalization") {
          accountMutated = {
            ...account,
            personalization: {
              ...(<PrimaryAccount>account).personalization,
              ...(value as PrimaryAccount["personalization"])
            }
          } as PrimaryAccount;
        }
        else if ((key as keyof ExternalAccount) === "data") {
          accountMutated = {
            ...account,
            data: {
              ...(<ExternalAccount>account).data,
              ...(value as ExternalAccount["data"])
            }
          } as ExternalAccount;
        }
        // Mutate the property.
        else {
          accountMutated = {
            ...account,
            [key]: value
          };
        }

        // Save the update in the store and storage.
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.localID === localID
              ? accountMutated
              : account
          )
        }));

        // Return the updated account (to reuse the account directly)
        return accountMutated;
      },
    }),
    {
      name: "accounts-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
