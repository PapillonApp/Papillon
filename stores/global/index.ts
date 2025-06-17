import { MMKV } from 'react-native-mmkv'
import { PersistStorage } from 'zustand/middleware'

export const createMMKVStorage = <T>(id: string, encryptionKey?: string): PersistStorage<T> => {
  const mmkv = new MMKV({
    id: id,
    encryptionKey: encryptionKey
  })

  return {
    getItem: (name) => {
      const value = mmkv.getString(name)
      return value ? JSON.parse(value) : null
    },
    setItem: (name, value) => {
      mmkv.set(name, JSON.stringify(value))
    },
    removeItem: (name) => {
      mmkv.delete(name)
    }
  }
}