import * as FileSystem from 'expo-file-system';
import { PersistStorage } from 'zustand/middleware';
import { UniversalClassSerializer } from '@/stores/global/serializer';

const classRegistry = new Map<string, any>();
// NOTE: We might need to register classes here if they are stored directly.
// For now, assuming basic JSON-serializable state.

const getStoragePath = (id: string) => `${FileSystem.documentDirectory}${id}.json`;

async function readStorage(id: string): Promise<Record<string, any>> {
  const path = getStoragePath(id);
  try {
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(path);
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Failed to read file storage:', error);
  }
  return {};
}

async function writeStorage(id: string, data: Record<string, any>): Promise<void> {
  const path = getStoragePath(id);
  try {
    await FileSystem.writeAsStringAsync(path, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to write file storage:', error);
  }
}

export const createFileStorage = <T>(id: string): PersistStorage<T> => {
  let storageCache: Record<string, any> | null = null;

  const getStorage = async () => {
    if (storageCache === null) {
      storageCache = await readStorage(id);
    }
    return storageCache;
  };

  return {
    getItem: async (name) => {
      const storage = await getStorage();
      const value = storage[name];
      if (value === undefined) {
        return null;
      }
      return UniversalClassSerializer.deserialize(value, classRegistry);
    },
    setItem: async (name, value) => {
      const storage = await getStorage();
      storage[name] = UniversalClassSerializer.serialize(value);
      storageCache = storage; // Update cache immediately
      await writeStorage(id, storage);
    },
    removeItem: async (name) => {
      const storage = await getStorage();
      delete storage[name];
      storageCache = storage; // Update cache immediately
      await writeStorage(id, storage);
    },
  };
};