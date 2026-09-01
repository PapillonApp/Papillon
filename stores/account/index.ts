import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { deleteMyCpeToken } from "@/services/mycpe/token-storage";
import { log, warn } from "@/utils/logger/logger";
import { trackAdvancedEvent, trackOptionalEvent } from "@/utils/logger/analytics";
import { initializeTransport } from "@/utils/transport";

import { createMMKVStorage } from '../global'
import {
  AccountsStorage,
  Auth,
  ServiceAccount,
  Services,
  TransportAddress,
} from "./types";

const clearServiceSecrets = async (
  services: ServiceAccount[]
): Promise<boolean> => {
  let cleared = true;

  for (const service of services) {
    if (service.serviceId !== Services.MYCPE) continue;

    try {
      await deleteMyCpeToken(service.id);
    } catch (cleanupError) {
      cleared = false;
      warn(
        `Unable to remove secure credentials for service ${service.id}: ${String(cleanupError)}`,
        "accountStore.clearServiceSecrets"
      );
    }
  }

  return cleared;
};

export const useAccountStore = create<AccountsStorage>()(
  persist(
    (set, get) => ({
      lastUsedAccount: "",
      accounts: [],
      reset: async () => {
        const services = get().accounts.flatMap(account => account.services);
        if (!(await clearServiceSecrets(services))) return false;

        set({
          lastUsedAccount: "",
          accounts: [],
        });
        return true;
      },
      removeAccount: async account => {
        if (!(await clearServiceSecrets(account.services))) return false;

        const accounts = get().accounts.filter(a => a.id !== account.id);
        const lastUsedAccount = get().lastUsedAccount;

        set({
          accounts,
          lastUsedAccount:
            lastUsedAccount === account.id
              ? (accounts[0]?.id ?? "")
              : lastUsedAccount,
        });
        return true;
      },
      addAccount: account => {
        set({ accounts: [...get().accounts, account] });
        trackOptionalEvent("new_account_logged_in");
      },
      updateServiceAuthData: (serviceId: string, authData: Auth) =>
        set({
          accounts: get().accounts.map(account => {
            const hasService = account.services.some(
              service => service.id === serviceId
            );
            if (hasService) {
              return {
                ...account,
                services: account.services.map(service =>
                  service.id === serviceId
                    ? { ...service, auth: authData }
                    : service
                ),
              };
            }
            return account;
          }),
        }),
      addServiceToAccount: (accountId, service) => {
        set({
          accounts: get().accounts.map(account => {
            if (account.id === accountId) {
              return {
                ...account,
                services: [...account.services, service],
              };
            }
            return account;
          }),
        });
        trackAdvancedEvent("external_account_added");
      },
      removeServiceFromAccount: async serviceId => {
        const services = get()
          .accounts.flatMap(account => account.services)
          .filter(service => service.id === serviceId);
        if (!(await clearServiceSecrets(services))) return false;

        set({
          accounts: get().accounts.map(account => {
            if (account.services.find(service => service.id === serviceId)) {
              return {
                ...account,
                services: account.services.filter(
                  service => service.id !== serviceId
                ),
              };
            }
            return account;
          }),
        });
        return true;
      },
      setAccountProfilePicture: (accountId, profilePicture) =>
        set({
          accounts: get().accounts.map(account => {
            if (account.id === accountId) {
              return {
                ...account,
                customisation: {
                  profilePicture,
                  subjects: account.customisation?.subjects ?? {},
                },
              };
            }
            return account;
          }),
        }),
      setAccountName: (accountId, firstName, lastName) =>
        set({
          accounts: get().accounts.map(account => {
            if (account.id === accountId) {
              return {
                ...account,
                firstName,
                lastName,
              };
            }
            return account;
          }),
        }),
      setLastUsedAccount: (accountId: string) =>
        set({ lastUsedAccount: accountId }),
      setSubjectColor: (subject: string, color: string) =>
        set({
          accounts: get().accounts.map(account => {
            if (account.id === get().lastUsedAccount) {
              return {
                ...account,
                customisation: {
                  ...account.customisation,
                  profilePicture: account.customisation?.profilePicture ?? "",
                  subjects: {
                    ...account.customisation?.subjects,
                    [subject]: {
                      emoji:
                        account.customisation?.subjects?.[subject]?.emoji || "",
                      name:
                        account.customisation?.subjects?.[subject]?.name || "",
                      color: color,
                    },
                  },
                },
              };
            }
            return account;
          }),
        }),
      setSubjectEmoji: (subject: string, emoji: string) =>
        set({
          accounts: get().accounts.map(account => {
            if (account.id === get().lastUsedAccount) {
              return {
                ...account,
                customisation: {
                  ...account.customisation,
                  profilePicture: account.customisation?.profilePicture ?? "",
                  subjects: {
                    ...account.customisation?.subjects,
                    [subject]: {
                      emoji: emoji,
                      color:
                        account.customisation?.subjects?.[subject]?.color || "",
                      name:
                        account.customisation?.subjects?.[subject]?.name || "",
                    },
                  },
                },
              };
            }
            return account;
          }),
        }),
      setSubjectName: (subject: string, name: string) =>
        set({
          accounts: get().accounts.map(account => {
            if (account.id === get().lastUsedAccount) {
              return {
                ...account,
                customisation: {
                  ...account.customisation,
                  profilePicture: account.customisation?.profilePicture ?? "",
                  subjects: {
                    ...account.customisation?.subjects,
                    [subject]: {
                      emoji:
                        account.customisation?.subjects?.[subject]?.emoji || "",
                      color:
                        account.customisation?.subjects?.[subject]?.color || "",
                      name: name,
                    },
                  },
                },
              };
            }
            return account;
          }),
        }),
      setSubjects: (subjects: Record<string, Subject>) =>
        set({
          accounts: get().accounts.map(account => {
            if (account.id === get().lastUsedAccount) {
              return {
                ...account,
                customisation: {
                  ...account.customisation,
                  profilePicture: account.customisation?.profilePicture ?? "",
                  subjects: subjects,
                },
              };
            }
            return account;
          }),
        }),
      setTransportEnabled: (transportEnabled: boolean) =>
        set({
          accounts: get().accounts.map(account => {
            if (account.id === get().lastUsedAccount) {
              return {
                ...account,
                transport: {
                  ...account.transport,
                  enabled: transportEnabled,
                  homeAddress: account.transport?.homeAddress ?? {
                    firstTitle: "current_location",
                    secondTitle: "",
                    address: "current_location",
                    longitude: -1,
                    latitude: -1,
                  },
                  defaultApp: account.transport?.defaultApp ?? "google_maps",
                },
              };
            }
            return account;
          }),
        }),
      setTransportService: (id: string) =>
        set({
          accounts: get().accounts.map(account => {
            if (account.id === get().lastUsedAccount) {
              return {
                ...account,
                transport: {
                  ...account.transport,
                  enabled: true,
                  defaultApp: id,
                },
              };
            }
            return account;
          }),
        }),
      setTransportHomeAddress: (address: TransportAddress) =>
        set({
          accounts: get().accounts.map(account => {
            if (account.id === get().lastUsedAccount) {
              return {
                ...account,
                transport: {
                  ...account.transport,
                  enabled: true,
                  defaultApp: account.transport?.defaultApp ?? "google_maps",
                  homeAddress: address,
                },
              };
            }
            return account;
          }),
        }),
      setTransportSchoolAddress: (address: TransportAddress) =>
        set({
          accounts: get().accounts.map(account => {
            if (account.id === get().lastUsedAccount) {
              return {
                ...account,
                transport: {
                  ...account.transport,
                  enabled: true,
                  defaultApp: account.transport?.defaultApp ?? "google_maps",
                  schoolAddress: address,
                },
              };
            }
            return account;
          }),
        }),
      initializeTransport: async (address: string | undefined) => {
        const config = await initializeTransport(address);
        log(`Initialized transport at ${JSON.stringify(config.schoolAddress) ?? 'undefined'}`);
        set({
          accounts: get().accounts.map(account => {
            if (account.id === get().lastUsedAccount) {
              return {
                ...account,
                transport: config,
              };
            }
            return account;
          }),
        })
      },
    }),
    {
      name: "account-storage",
      storage: createMMKVStorage<AccountsStorage>(
        "account-storage",
        "3f64fc8d-472d-43d5-ba11-461020e2423b"
      ),
    }
  )
);
