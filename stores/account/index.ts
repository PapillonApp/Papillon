import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createMMKVStorage } from '../global'
import { AccountsStorage, Auth } from "./types";

export const useAccountStore = create<AccountsStorage>()(
  persist(
    (set, get) => ({
      lastUsedAccount: '',
      accounts: [],
      removeAccount: (account) => {
        const accounts = get().accounts.filter((a) => a.id !== account.id);
        const lastUsedAccount = get().lastUsedAccount;

        set({
          accounts,
          lastUsedAccount: lastUsedAccount === account.id ? (accounts[0]?.id ?? '') : lastUsedAccount,
        });
      },
      addAccount: (account) => set({ accounts: [...get().accounts, account] }),
      updateServiceAuthData: (serviceId: string, authData: Auth) => set({
        accounts: get().accounts.map((account) => {
          const hasService = account.services.some((service) => service.id === serviceId);
          if (hasService) {
            return {
              ...account,
              services: account.services.map((service) =>
                service.id === serviceId ? { ...service, auth: authData } : service
              ),
            };
          }
          return account;
        }),
      }),
      addServiceToAccount: (accountId, service) => set({
        accounts: get().accounts.map((account) => {
          if (account.id === accountId) {
            return {
              ...account,
              services: [...account.services, service],
            };
          }
          return account;
        }),
      }),
      removeServiceFromAccount: (serviceId) => set({
        accounts: get().accounts.map((account) => {
          if (account.services.find(service => service.id === serviceId)) {
            return {
              ...account,
              services: account.services.filter(service => service.id !== serviceId),
            };
          }
          return account;
        }),
      }),
      setAccountProfilePicture: (accountId, profilePicture) => set({
        accounts: get().accounts.map((account) => {
          if (account.id === accountId) {
            return {
              ...account,
              customisation: {
                profilePicture,
                subjects: account.customisation?.subjects ?? {}
              }
            };
          }
          return account;
        }),
      }),
      setAccountName: (accountId, firstName, lastName) => set({
        accounts: get().accounts.map((account) => {
          if (account.id === accountId) {
            return {
              ...account,
              firstName,
              lastName
            };
          }
          return account;
        }),
      }),
      setLastUsedAccount: (accountId: string) => set({ lastUsedAccount: accountId }),
      setSubjectColor: (subject: string, color: string) => set({
        accounts: get().accounts.map((account) => {
          if (account.id === get().lastUsedAccount) {
            return {
              ...account,
              customisation: {
                ...account.customisation,
                profilePicture: account.customisation?.profilePicture ?? "",
                subjects: {
                  ...account.customisation?.subjects,
                  [subject]: {
                    emoji: account.customisation?.subjects?.[subject]?.emoji || '',
                    name: account.customisation?.subjects?.[subject]?.name || '',
                    color: color
                  }
                }
              }
            };
          }
          return account
        }),
      }),
      setSubjectEmoji: (subject: string, emoji: string) => set({
        accounts: get().accounts.map((account) => {
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
                    color: account.customisation?.subjects?.[subject]?.color || '',
                    name: account.customisation?.subjects?.[subject]?.name || '',
                  }
                }
              }
            };
          }
          return account
        }),
      }),
      setSubjectName: (subject: string, name: string) => set({
        accounts: get().accounts.map((account) => {
          if (account.id === get().lastUsedAccount) {
            return {
              ...account,
              customisation: {
                ...account.customisation,
                profilePicture: account.customisation?.profilePicture ?? "",
                subjects: {
                  ...account.customisation?.subjects,
                  [subject]: {
                    emoji: account.customisation?.subjects?.[subject]?.emoji || '',
                    color: account.customisation?.subjects?.[subject]?.color || '',
                    name: name,
                  }
                }
              }
            };
          }
          return account
        }),
      })
    }),
    {
      name: 'account-storage',
      storage: createMMKVStorage<AccountsStorage>("account-storage", "3f64fc8d-472d-43d5-ba11-461020e2423b")
    }
  )
)