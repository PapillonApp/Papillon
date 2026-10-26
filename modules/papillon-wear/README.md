# papillon-wear

Google [Wearable Data Layer API](https://developer.android.com/training/wearables/data/overview)
bridge exposed as an Expo module for synchronizing Papillon's timetable, grades,
homework, and canteen QR/barcode cards with the Wear OS companion app.

Android only. On iOS and Web, every function is a safe no-op — callers do not
need to branch.

## Rebuilding

This is a native module, so it requires an Android prebuild:

```bash
npx expo prebuild -p android
```

## Usage

In the mobile app, automatic synchronization is handled by `useWearSync()` in
`utils/wear/useWearSync.android.ts`. You can also trigger an immediate sync or
query connected watches directly:

```ts
import {
  getConnectedWatches,
  syncWatchData,
  wearIsSupported,
} from "@/modules/papillon-wear";
```

## Bidirectional Events

The Wear OS companion app can send two messages back to the handheld app:

- `/papillon/request_sync`: requests a fresh data snapshot (falls back to the
  last cached payload in `SharedPreferences` if the React Native runtime is in
  the background).
- `/papillon/toggle_homework`: marks a homework task as done or undone directly
  from the wrist and updates both the school service and WatermelonDB.
