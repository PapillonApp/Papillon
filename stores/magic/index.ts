import { create } from 'zustand'

import { Item, MagicStorage } from './types'

export const useMagicStore = create<MagicStorage>((set, get) => ({
  processHomeworks: [],
  getHomework: (id: string) => get().processHomeworks.find(homework => homework.id === id),
  addHomework: (item: Item) => set({ processHomeworks: [...get().processHomeworks, item] }),
  clear: () => set({ processHomeworks: [] }),
}))