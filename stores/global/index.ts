import { createMMKV } from 'react-native-mmkv'
import { Platform } from 'react-native'
import { Skolengo as SkolengoSession } from "skolengojs";
import { PersistStorage } from 'zustand/middleware'

import { UniversalClassSerializer } from './serializer';

const classRegistry = new Map<string, any>();
classRegistry.set('Skolengo', SkolengoSession);

export const createMMKVStorage = <T>(id: string, encryptionKey?: string): PersistStorage<T> => {
  const mmkv = createMMKV({
    id: id,
    // react-native-mmkv's web build (backed by localStorage) throws if
    // `encryptionKey` is present at all, even set to undefined explicitly
    // wouldn't help — it has to be entirely absent from the config object.
    // There is no at-rest encryption on web/Electron either way.
    ...(Platform.OS !== 'web' && encryptionKey ? { encryptionKey } : {}),
  });

  return {
    getItem: (name) => {
      const value = mmkv.getString(name);
      if (!value) {return null;}
      
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
      mmkv.remove(name);
    }
  };
};