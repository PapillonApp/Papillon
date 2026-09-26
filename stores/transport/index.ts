import { create } from "zustand";
import { persist } from "zustand/middleware";

import { prune, put } from "@/services/transport/cache";
import type { CommuteCacheEntry } from "@/services/transport/types";

import { createMMKVStorage } from "../global";

interface TransportCacheStorage {
  entries: Record<string, CommuteCacheEntry>;
  blockedUntil?: string;
  put: (key: string, entry: CommuteCacheEntry) => void;
  prune: (now: Date) => void;
  setBlockedUntil: (date: Date | undefined) => void;
}

export const useTransportStore = create<TransportCacheStorage>()(
  persist(
    (set, get) => ({
      entries: {},
      blockedUntil: undefined,
      put: (key, entry) => set({ entries: put(get().entries, key, entry) }),
      prune: now => set({ entries: prune(get().entries, now) }),
      setBlockedUntil: date => set({ blockedUntil: date?.toISOString() }),
    }),
    {
      name: "transport-storage",
      storage: createMMKVStorage<TransportCacheStorage>("transport-storage"),
      onRehydrateStorage: () => state => state?.prune(new Date()),
    }
  )
);
