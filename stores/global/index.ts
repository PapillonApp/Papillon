import { Platform } from 'react-native'
import { createMMKV } from 'react-native-mmkv'
import { Skolengo as SkolengoSession } from "skolengojs";
import { PersistStorage } from 'zustand/middleware'

import { UniversalClassSerializer } from './serializer';

const classRegistry = new Map<string, any>();
classRegistry.set('Skolengo', SkolengoSession);

export const createMMKVStorage = <T>(id: string, encryptionKey?: string): PersistStorage<T> => {
  const mmkv = createMMKV({
    id: id,
    // react-native-mmkv ne supporte pas le chiffrement sur le web (son
    // implémentation web repose sur localStorage) : passer une
    // encryptionKey y lève une exception ("'encryptionKey' is not
    // supported on Web!"). On ne l'applique donc que sur iOS/Android — la
    // clé étant de toute façon codée en dur dans le bundle JS, ce n'est
    // qu'une protection légère contre la lecture directe du fichier, pas
    // un vrai chiffrement à clé secrète.
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