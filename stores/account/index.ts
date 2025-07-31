import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createMMKVStorage } from '../global'
import { AccountsStorage, Auth } from "./types";

export const useAccountStore = create<AccountsStorage>()(
  persist(
    (set, get) => ({
      lastUsedAccount: '',
      accounts: [],
      removeAccount: (account) => set({ accounts: [...get().accounts.filter((a) => a.id !== account.id)] }),
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
      setLastUsedAccount: (accountId) => set({ lastUsedAccount: accountId }),
    }),
    {
      name: 'account-storage',
      storage: createMMKVStorage<AccountsStorage>("account-storage", "edit-the-key-in-future"),
    }
  )
)
