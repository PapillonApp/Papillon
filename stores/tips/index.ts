import { create } from "zustand";
import { persist } from "zustand/middleware";

import { TipVisitsRequired, type TipId } from "@/constants/Tips";
import { invalidateTip } from "@/modules/papillon-tips";

import { createMMKVStorage } from "../global";

interface TipsStorage {
  /** Times each tip's screen has been opened, counted until the tip shows. */
  visits: Partial<Record<TipId, number>>;
  /**
   * Times each tip has actually been put on screen.
   *
   * This is what stops a dismissed tip coming back. TipKit only files a
   * dismissal when the user hits the close button — tapping outside the callout
   * just takes the popover away and leaves the tip eligible, so it returns on
   * the very next redraw of the screen behind it. Counting the showings here
   * gives every tip a fixed budget that no dismissal path can dodge.
   */
  shows: Partial<Record<TipId, number>>;
  /**
   * Tips that are done for good, because the user did the thing they teach.
   *
   * TipKit is told too, but this is the copy that decides: a tip whose
   * invalidation did not take — an unconfigured datastore, a dismissal TipKit
   * does not count — would otherwise keep coming back forever.
   */
  retired: TipId[];
  /**
   * Debug override: show every tip at once, thresholds and dismissals ignored.
   * Persisted so it survives the relaunch that a datastore reset needs.
   */
  forceAll: boolean;
  /**
   * TipKit only lets its datastore be wiped before it is configured, which has
   * already happened by the time anyone can reach the debug menu. So a reset is
   * recorded here and carried out on the next launch.
   */
  pendingDatastoreReset: boolean;

  recordVisit: (tipId: TipId) => void;
  recordShow: (tipId: TipId) => void;
  retire: (tipId: TipId) => void;
  setForceAll: (forceAll: boolean) => void;
  requestDatastoreReset: () => void;
  clearPendingDatastoreReset: () => void;
  reset: () => void;
}

export const useTipsStore = create<TipsStorage>()(
  persist(
    (set) => ({
      visits: {},
      shows: {},
      retired: [],
      forceAll: false,
      pendingDatastoreReset: false,

      // Stops counting once the tip has earned its place. Nothing reads the
      // number past that point, and this runs on every screen entry — no reason
      // to keep writing to disk for the rest of the install.
      recordVisit: (tipId) =>
        set(state => {
          const seen = state.visits[tipId] ?? 0;
          if (seen >= (TipVisitsRequired[tipId] ?? 1)) {
            return state;
          }
          return { visits: { ...state.visits, [tipId]: seen + 1 } };
        }),

      recordShow: (tipId) =>
        set(state => ({
          shows: { ...state.shows, [tipId]: (state.shows[tipId] ?? 0) + 1 },
        })),

      retire: (tipId) =>
        set(state =>
          state.retired.includes(tipId)
            ? state
            : { retired: [...state.retired, tipId] }
        ),

      setForceAll: (forceAll) => set({ forceAll }),

      requestDatastoreReset: () => set({ pendingDatastoreReset: true }),

      clearPendingDatastoreReset: () => set({ pendingDatastoreReset: false }),

      reset: () => set({ visits: {}, shows: {}, retired: [], forceAll: false }),
    }),
    {
      name: "tips-storage",
      storage: createMMKVStorage("tips"),
      version: 1,
    }
  )
);

/**
 * Puts a tip away for good, because the user just did the thing it teaches.
 *
 * Retires it on both sides: TipKit stops offering it, and — whether or not that
 * took — nothing here will mount it again.
 */
export function retireTip(tipId: TipId): void {
  // Called from gesture handlers that fire every frame, so it has to be cheap
  // once the work is done.
  if (useTipsStore.getState().retired.includes(tipId)) {
    return;
  }
  useTipsStore.getState().retire(tipId);
  void invalidateTip(tipId);
}
