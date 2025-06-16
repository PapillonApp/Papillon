import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createMMKVStorage } from '../global'
import { AccountsStorage } from './types'

export const useAccountStore = create<AccountsStorage>()(
  persist(
    (set, get) => ({
      lastUsedAccount: '',
      accounts: [],
      removeAccount: (account) => set({ accounts: [...get().accounts.filter((a) => a.id !== account.id)] }),
      addAccount: (account) => set({ accounts: [...get().accounts, account] }),
      setLastUsedAccount: (accountId) => set({ lastUsedAccount: accountId }),
    }),
    {
      name: 'account-storage',
      storage: createMMKVStorage<AccountsStorage>("account-storage", "edit-the-key-in-future"),
    }
  )
)
