import { MMKV } from 'react-native-mmkv';
import { Skolengo as SkolengoSession } from "skolengojs";
import { PersistStorage } from 'zustand/middleware';

import { UniversalClassSerializer } from './serializer';
import { isWindows } from '@/utils/platform';
import { createFileStorage } from '@/utils/fileStorage';

const classRegistry = new Map<string, any>();
classRegistry.set('Skolengo', SkolengoSession);

/**
 * Creates a platform-aware persistent storage for Zustand.
 * - On mobile (iOS/Android), it uses react-native-mmkv for fast, synchronous storage.
 * - On Windows, it falls back to a JSON file-based asynchronous storage system
 *   using expo-file-system.
 *
 * @param id The unique identifier for the storage instance.
 * @param encryptionKey (Optional) The key to encrypt the storage (mobile only).
 * @returns A PersistStorage object compatible with Zustand.
 */
export const createPersistStorage = <T>(id: string, encryptionKey?: string): PersistStorage<T> => {
  if (isWindows) {
    // On Windows, use the asynchronous file-based storage.
    return createFileStorage(id);
  }

  // On mobile, use the synchronous MMKV storage.
  const mmkv = new MMKV({
    id,
    encryptionKey,
  });

  return {
    getItem: (name) => {
      const value = mmkv.getString(name);
      if (value === undefined || value === null) {
        return null;
      }
      
      try {
        const parsed = JSON.parse(value);
        return UniversalClassSerializer.deserialize(parsed, classRegistry);
      } catch (error) {
        console.error('Error parsing MMKV data:', error);
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        const serialized = UniversalClassSerializer.serialize(value);
        mmkv.set(name, JSON.stringify(serialized));
      } catch (error) {
        console.error('Error serializing MMKV data:', error);
      }
    },
    removeItem: (name) => {
      mmkv.delete(name);
    },
  };
};