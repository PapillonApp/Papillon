import { create } from 'zustand'
import { LogsStorage } from './types'

export const useLogStore = create<LogsStorage>((set, get) => ({
  logs: [],
  addItem: (log: string) => set({ logs: [...get().logs, log] })
}))