import { create } from 'zustand'
import { Log, LogsStorage } from './types'

export const useLogStore = create<LogsStorage>((set, get) => ({
  logs: [],
  addItem: (log: Log) => set({ logs: [...get().logs, log] })
}))