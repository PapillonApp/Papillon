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
  PrimaryAccount,
  PapillonMultiServiceSpace,
} from "@/stores/account/types";
import { reload } from "@/services/reload-account";
import { useTimetableStore } from "../timetable";
import { useHomeworkStore } from "../homework";
import { useGradesStore } from "../grades";
import { useNewsStore } from "../news";
import { useAttendanceStore } from "../attendance";
import { error, info, log } from "@/utils/logger/logger";
import { useMultiService } from "@/stores/multiService";
import { MultiServiceFeature } from "@/stores/multiService/types";

const STORES_TO_REHYDRATE = [
  [useTimetableStore, "timetable"],
  [useHomeworkStore, "homework"],
  [useGradesStore, "grades"],
  [useNewsStore, "news"],
  [useAttendanceStore, "attendance"],
] as const;

export const useCurrentAccount = create<CurrentAccountStore>()((set, get) => ({
  account: null,
  linkedAccounts: [],
  associatedAccounts: [],

  mutateProperty: <T extends keyof PrimaryAccount>(
    key: T,
    value: PrimaryAccount[T],
    forceMutation = false
  ) => {
    log(`mutate property ${key} in storage`, "current:update");
    const currentAccount = get().account;
    if (!currentAccount) return;

    if (
      currentAccount.service === AccountService.PapillonMultiService &&
      key === "personalization" &&
      !forceMutation
    ) {
      const val = value as PrimaryAccount["personalization"];
      delete val.profilePictureB64;
    }

    if (key === "instance") {
      set({
        account: {
          ...currentAccount,
          // @ts-expect-error
          instance: value,
        },
      });
      return;
    }

    const localID = currentAccount.localID;
    const account = useAccounts.getState().update(localID, key, value);
    set({
      account: {
        ...account,
        // @ts-expect-error
        instance: currentAccount.instance,
      },
    });
    log(`done mutating property ${key} in storage`, "[current:update]");
  },

  switchTo: async (account) => {
    log(`reading ${account.name}`, "switchTo");
    set({ account });
    useAccounts.setState({ lastOpenedAccountID: account.localID });

    const rehydrationPromises = STORES_TO_REHYDRATE.map(
      ([store, storageName]) => {
        store.persist.setOptions({
          name: `${account.localID}-${storageName}-storage`,
        });
        info(`rehydrating ${storageName}`, "switchTo");
        return store.persist.rehydrate();
      }
    );

    await Promise.all(rehydrationPromises);

    const accounts = useAccounts.getState().accounts;
    const currentGet = get();

    if (account.service === AccountService.PapillonMultiService) {
      log("switching to virtual space...", "[switchTo]");
    } else if (typeof account.instance === "undefined") {
      log("instance undefined, reloading...", "switchTo");
      const { instance, authentication } = await reload(account);
      currentGet.mutateProperty("authentication", authentication);
      currentGet.mutateProperty("instance", instance);
      log("instance reload done!", "switchTo");
    }

    const linkedAccounts = account.linkedExternalLocalIDs
      .map((linkedID) => accounts.find((acc) => acc.localID === linkedID))
      .filter(Boolean) as ExternalAccount[];

    const associatedAccounts = (account.associatedAccountsLocalIDs || [])
      .map((associatedID) =>
        accounts.find((acc) => acc.localID === associatedID)
      )
      .filter(Boolean) as PrimaryAccount[];

    info(`found ${linkedAccounts.length} external accounts...`, "switchTo");

    const reloadPromises = [
      ...linkedAccounts.map(async (linkedAccount) => {
        const { instance, authentication } = await reload(linkedAccount);
        linkedAccount.instance = instance;
        linkedAccount.authentication = authentication;
        log("reloaded external", "switchTo");
      }),
      ...associatedAccounts.map(async (associatedAccount) => {
        if (typeof associatedAccount.instance !== "undefined") return;
        try {
          const { instance, authentication } = await reload(associatedAccount);
          associatedAccount.instance = instance;
          associatedAccount.authentication = authentication;
          useAccounts
            .getState()
            .update(
              associatedAccount.localID,
              "authentication",
              authentication
            );
          log("reloaded associated account", "[switchTo]");
        } catch (err) {
          error(`failed to reload: ${err}!`, "[switchTo]");
        }
      }),
    ];

    await Promise.all(reloadPromises);

    if (account.service === AccountService.PapillonMultiService) {
      currentGet.mutateProperty("instance", "PapillonPrime");
    }

    set({ linkedAccounts, associatedAccounts });
    log(`done reading ${account.name}`, "switchTo");
  },

  linkExistingExternalAccount: (account) => {
    log("linking", "linkExistingExternalAccount");
    const currentAccount = get().account;
    if (!currentAccount) return;

    set((state) => ({
      linkedAccounts: [...state.linkedAccounts, account],
    }));

    get().mutateProperty("linkedExternalLocalIDs", [
      ...(currentAccount.linkedExternalLocalIDs || []),
      account.localID,
    ]);
    log("linked", "linkExistingExternalAccount");
  },

  logout: () => {
    const account = get().account;
    if (!account) return;

    log(`logging out ${account.name}`, "current:logout");
    if (account.service === AccountService.Pronote && account.instance) {
      pronote.clearPresenceInterval(account.instance);
      log("stopped pronote presence", "current:logout");
    }

    set({ account: null, linkedAccounts: [] });
    useAccounts.setState({ lastOpenedAccountID: null });
  },
}));

export const useAccounts = create<AccountsStore>()(
  persist(
    (set, get) => ({
      lastOpenedAccountID: null,
      accounts: [],

      setLastOpenedAccountID: (id) => {
        set({ lastOpenedAccountID: id });
        log(
          `lastOpenedAccountID updated: ${id}`,
          "accounts:setLastOpenedAccountID"
        );
      },

      create: ({ instance, ...account }) => {
        log(`storing ${account.localID}`, "accounts:create");
        set((state) => ({
          accounts: [...state.accounts, account as Account],
        }));
        log(`stored ${account.localID}`, "accounts:create");
      },

      remove: (localID) => {
        log(`removing ${localID}`, "accounts:remove");
        const accounts = get().accounts;
        const spacesAccounts = accounts.filter(
          (acc) => acc.service === AccountService.PapillonMultiService
        ) as PapillonMultiServiceSpace[];

        set({ accounts: accounts.filter((acc) => acc.localID !== localID) });

        const multiService = useMultiService.getState();
        spacesAccounts.forEach((spaceAccount) => {
          if (!spaceAccount.associatedAccountsLocalIDs.includes(localID))
            return;

          log(
            `found ${localID} in space ${spaceAccount.name}`,
            "accounts:remove"
          );
          const updatedSpaceAccount = {
            ...spaceAccount,
            associatedAccountsLocalIDs:
              spaceAccount.associatedAccountsLocalIDs.filter(
                (id) => id !== localID
              ),
          };

          const space = multiService.spaces.find(
            (s) => s.accountLocalID === spaceAccount.localID
          );
          if (space) {
            const updatedFeatures = { ...space.featuresServices };
            Object.entries(updatedFeatures).forEach(([key, value]) => {
              if (value === localID) {
                updatedFeatures[key as MultiServiceFeature] = undefined;
              }
            });
            multiService.update(
              spaceAccount.localID,
              "featuresServices",
              updatedFeatures
            );
          }

          set((state) => ({
            accounts: state.accounts.map((acc) =>
              acc.localID === spaceAccount.localID ? updatedSpaceAccount : acc
            ),
          }));

          if (updatedSpaceAccount.associatedAccountsLocalIDs.length === 0) {
            log(
              `space ${spaceAccount.name} is empty, removing`,
              "accounts:remove"
            );
            multiService.remove(spaceAccount.localID);
            set((state) => ({
              accounts: state.accounts.filter(
                (acc) => acc.localID !== spaceAccount.localID
              ),
            }));
          }
        });
        log(`removed ${localID}`, "accounts:remove");
      },

      update: (localID, key, value) => {
        const accounts = get().accounts;
        const account = accounts.find((acc) => acc.localID === localID);
        if (!account || key === "instance") return account || null;

        let accountMutated: Account;
        if (key === "personalization") {
          accountMutated = {
            ...account,
            personalization: {
              ...(account as PrimaryAccount).personalization,
              ...(value as PrimaryAccount["personalization"]),
            },
          } as PrimaryAccount;
        } else if (key === "data") {
          accountMutated = {
            ...account,
            data: {
              ...(account as ExternalAccount).data,
              ...(value as ExternalAccount["data"]),
            },
          } as ExternalAccount;
        } else {
          accountMutated = {
            ...account,
            [key]: value,
          };
        }

        set({
          accounts: accounts.map((acc) =>
            acc.localID === localID ? accountMutated : acc
          ),
        });

        return accountMutated;
      },
    }),
    {
      name: "accounts-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
