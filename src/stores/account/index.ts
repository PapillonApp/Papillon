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
  PrimaryAccount, PapillonMultiServiceSpace
} from "@/stores/account/types";
import { reload } from "@/services/reload-account";
import { useTimetableStore } from "../timetable";
import { useHomeworkStore } from "../homework";
import { useGradesStore } from "../grades";
import { useNewsStore } from "../news";
import { useAttendanceStore } from "../attendance";
import { error, info, log } from "@/utils/logger/logger";
import { useMultiService } from "@/stores/multiService";
import { MultiServiceFeature, MultiServiceSpace } from "@/stores/multiService/types";

/**
 * Store for the currently selected account.
 * Not persisted, as it's only used during the app's runtime.
 */
export const useCurrentAccount = create<CurrentAccountStore>()((set, get) => ({
  account: null,
  linkedAccounts: [],
  // For multi service, to not mix Primary & External accounts
  associatedAccounts: [],

  mutateProperty: <T extends keyof PrimaryAccount>(key: T, value: PrimaryAccount[T], forceMutation = false) => {
    log(`Mutate property ${key} in storage`, "current:update");

    // Special case to keep Papillon Space custom image
    if (get().account?.service === AccountService.PapillonMultiService && key === "personalization" && !forceMutation) {
      delete (value as PrimaryAccount["personalization"]).profilePictureB64;
    }

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

    log(`Done mutating property ${key} in storage`, "current:update");
  },

  switchTo: async (account) => {
    log(`Reading ${account.name}`, "switchTo");
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

    const accounts = useAccounts.getState().accounts;

    // Special case for spaces
    if (account.service === AccountService.PapillonMultiService) {
      log("Switching to virtual space, skipping main account reload and reloading associated accounts...", "switchTo");
    } else if (typeof account.instance === "undefined") { // Account is currently not authenticated,
      log("Instance undefined, reloading...", "switchTo");
      // Automatically reconnect the main instance.
      const { instance, authentication } = await reload(account);
      get().mutateProperty("authentication", authentication);
      get().mutateProperty("instance", instance);
      log("Instance reload done !", "switchTo");
    }

    const linkedAccounts = account.linkedExternalLocalIDs.map((linkedID) => {
      return { ...accounts.find((acc) => acc.localID === linkedID) };
    }).filter(Boolean) as ExternalAccount[] ?? [];

    const associatedAccounts = account.associatedAccountsLocalIDs?.map((associatedID) => {
      return { ...accounts.find((acc) => acc.localID === associatedID) };
    }).filter(Boolean) as PrimaryAccount[] ?? [];

    info(`found ${linkedAccounts.length} external accounts and ${associatedAccounts.length} associated accounts`, "switchTo");

    for (const linkedAccount of linkedAccounts) {
      const { instance, authentication } = await reload(linkedAccount);
      linkedAccount.instance = instance;
      linkedAccount.authentication = authentication;
      log("Reloaded external", "switchTo");
    }

    for (const associatedAccount of associatedAccounts) {
      if (!(typeof associatedAccount.instance === "undefined"))
        continue;
      const { instance, authentication } = await reload(associatedAccount).catch((err) => {
        error(`failed to reload associated account: ${err} !`, "switchTo");
        return {
          instance: associatedAccount.instance,
          authentication: associatedAccount.authentication
        };
      });
      associatedAccount.instance = instance;
      associatedAccount.authentication = authentication;
      // Persist authentification value (f.e if token was renewed, it's important to make it persistant)
      useAccounts.getState().update(associatedAccount.localID, "authentication", authentication);
      log("Reloaded associated account", "switchTo");
    }

    // Setting instance to a non-null value after associated accounts reload, to keep the loading icon while instances are reloading...
    if (account.service === AccountService.PapillonMultiService)
      get().mutateProperty("instance", "PapillonPrime"); // A random string, so the instance is not "undefined" or "null", to prevent creating infinite loading (an undefined instance is interpreted as a loading or disconnected account...)

    log("Reloaded all external and associated accounts", "switchTo");

    set({ linkedAccounts, associatedAccounts });
    log(`Done reading ${account.name} and rehydrating stores.`, "switchTo");
  },

  linkExistingExternalAccount: (account) => {
    log("Linking", "linkExistingExternalAccount");

    set((state) => ({
      linkedAccounts: [...state.linkedAccounts, account]
    }));

    get().mutateProperty("linkedExternalLocalIDs", [
      ...get().account?.linkedExternalLocalIDs ?? [],
      account.localID
    ]);

    log("Linked", "linkExistingExternalAccount");
  },

  logout: () => {
    const account = get().account;
    log(`Logging out ${account?.name}`, "current:logout");

    // When using PRONOTE, we should make sure to stop the background interval.
    if (account && account.service === AccountService.Pronote && account.instance) {
      pronote.clearPresenceInterval(account.instance);
      log("Stopped pronote presence", "current:logout");
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
        log(`Storing ${account.localID} (${"name" in account ? account.name : "no name"})`, "accounts:create");

        set((state) => ({
          accounts: [...state.accounts, account as Account]
        }));

        log(`Stored ${account.localID}`, "accounts:create");
      },

      remove: (localID) => {
        log(`Removing ${localID}`, "accounts:remove");

        set((state) => ({
          accounts: state.accounts.filter(
            (account) => account.localID !== localID
          )
        }));

        // Update of multi-service environments to prevent :
        // 1. If the deleted account was associated to a space : its reference need to be removed from this space
        // 2. If a multi-service has no more associated accounts, it must be deleted (because a space is like a "group" of accounts, and without any associated accounts it does not work anymore⁾

        // Fetching the accounts corresponding to spaces
        const spacesAccounts: PapillonMultiServiceSpace[]  = get().accounts.filter((account) => account.service === AccountService.PapillonMultiService) as PapillonMultiServiceSpace[];
        for (const spaceAccount of spacesAccounts) {

          // The account deleted above is associated to this space
          if (spaceAccount.associatedAccountsLocalIDs.includes(localID)) {
            log(`Found ${localID} in PapillonMultiServiceSpace ${spaceAccount.name}`, "accounts:remove");

            // Remove the link to the account (and to every feature to which it is linked)
            spaceAccount.associatedAccountsLocalIDs.splice(spaceAccount.associatedAccountsLocalIDs.indexOf(localID), 1);
            const space = useMultiService.getState().spaces.find((space) => space.accountLocalID === spaceAccount.localID) as MultiServiceSpace;
            Object.entries(space.featuresServices).map(([key, value]) => {
              if (value === localID) {
                space.featuresServices[key as MultiServiceFeature] = undefined;
              }
            });
            useMultiService.getState().update(spaceAccount.localID, "featuresServices", space.featuresServices);
            set((state) => ({
              accounts: state.accounts.map((account) =>
                account.localID === spaceAccount.localID ? spaceAccount : account
              )
            }));
            log(`Removed ${localID} from PapillonMultiServiceSpace ${spaceAccount.name}`, "accounts:remove");
          }

          // If the space is now empty; deleting it
          if (spaceAccount.associatedAccountsLocalIDs.length === 0) {
            log(`PapillonMultiServiceSpace ${spaceAccount.name} is now empty, removing it`, "accounts:remove");
            useMultiService.getState().remove(spaceAccount.localID);
            set((state) => ({
              accounts: state.accounts.filter(
                (account) => account.localID !== spaceAccount.localID
              )
            }));
            log(`Deleted PapillonMultiServiceSpace ${spaceAccount.name}`, "accounts:remove");
          }
        }

        log(`Removed ${localID}`, "accounts:remove");
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
