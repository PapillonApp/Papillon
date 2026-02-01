import is from "@sindresorhus/is";
import { Platform } from "react-native";
import { createMMKV, existsMMKV } from 'react-native-mmkv'
import RNFetchBlob from "rn-fetch-blob";
import { Skolengo as SkolengoSession } from "skolengojs";
import { PersistStorage } from 'zustand/middleware'

import { UniversalClassSerializer } from './serializer';
import undefined = is.undefined;

const classRegistry = new Map<string, any>();
classRegistry.set('Skolengo', SkolengoSession);

export const createMMKVStorage = <T>(id: string, encryptionKey?: string): PersistStorage<T> => {

  if (Platform.OS === "ios") {
    if (existsMMKV(id)) {
      const oldMMKV = createMMKV({
        id: id,
        encryptionKey,
      });
      const transferedMMKV = createMMKV({
        id: id,
        encryptionKey,
        // @ts-expect-error - This method exist.
        path: RNFetchBlob.fs.syncPathAppGroup("group.xyz.getpapillon.ios"),
      });

      transferedMMKV.importAllFrom(oldMMKV);
      oldMMKV.clearAll();
    }
  }

  const mmkv = createMMKV({
    id: id,
    encryptionKey,
    // @ts-expect-error - This method exist.
    path: Platform.OS === "ios" ? RNFetchBlob.fs.syncPathAppGroup("group.xyz.getpapillon.ios"):undefined,
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