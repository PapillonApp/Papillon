import { createMMKV, MMKV } from 'react-native-mmkv'
import { Skolengo as SkolengoSession } from "skolengojs";
import { PersistStorage } from 'zustand/middleware'

import { createEncryptedMMKV } from './encryption';
import { UniversalClassSerializer } from './serializer';

const classRegistry = new Map<string, any>();
classRegistry.set('Skolengo', SkolengoSession);

export const createMMKVStorage = <T>(id: string): PersistStorage<T> =>
  wrapMMKV<T>(createMMKV({ id }));

export const createEncryptedMMKVStorage = <T>(id: string, legacyKey?: string): PersistStorage<T> => {
  const mmkv = createEncryptedMMKV(id, legacyKey);
  if (!mmkv) {
    return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  }
  return wrapMMKV<T>(mmkv);
};

const wrapMMKV = <T>(mmkv: MMKV): PersistStorage<T> => {
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