import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ServiceAuthState } from "@/services/auth/types";

import { createEncryptedMMKVStorage } from "../global";

interface AuthStateStorage {
  services: Record<string, ServiceAuthState>;
  setServiceState: (serviceId: string, state: ServiceAuthState) => void;
  clearServiceState: (serviceId: string) => void;
  prune: (existingServiceIds: string[]) => void;
}

// Encrypted like the accounts: a fingerprint of a short password could be
// brute-forced from a readable file. MMKV writes synchronously, so a kill
// right after a step still leaves it on disk.
export const useAuthStateStore = create<AuthStateStorage>()(
  persist(
    (set, get) => ({
      services: {},
      setServiceState: (serviceId, state) =>
        set({ services: { ...get().services, [serviceId]: state } }),
      clearServiceState: serviceId => {
        const { [serviceId]: _removed, ...services } = get().services;
        set({ services });
      },
      prune: existingServiceIds => {
        const existing = new Set(existingServiceIds);
        const entries = Object.entries(get().services);
        const kept = entries.filter(([id]) => existing.has(id));
        // Runs on every sync: skip the encrypted write when nothing was removed.
        if (kept.length !== entries.length) {
          set({ services: Object.fromEntries(kept) });
        }
      },
    }),
    {
      name: "auth-state-storage",
      // Static key, never change it: the file would become unreadable
      storage: createEncryptedMMKVStorage<AuthStateStorage>(
        "auth-state-storage",
        "f53dee47-5d32-4fb9-833d-6c5fcd897d3d"
      ),
    }
  )
);
