# Protected Wear OS companion module (`:wear`)

Expo prebuild owns the generated `android` directory and recreates it on clean
prebuilds. The files in `native/wear` are the versioned source of truth for the
native Wear OS companion application (`:wear`):

- **Jetpack Compose for Wear OS UI**:
  - `HomeScreen`: Next/current course hero card & quick navigation hub
  - `TimetableScreen`: Daily & upcoming classes with rooms, teachers, and status
  - `GradesScreen`: Overall/class averages, recent grades, and subject averages
  - `HomeworkScreen`: Upcoming tasks with bidirectional completion checkboxes
  - `CanteenCardScreen`: Canteen balance & full-brightness QR / CODE39 barcode
- **Wear OS Tile (`NextCourseTileService`)**: Quick-glance tile for the current
  or upcoming class
- **Watchface Complication (`NextCourseComplicationService`)**: `SHORT_TEXT`,
  `LONG_TEXT`, and `RANGED_VALUE` complications for any Wear OS watchface
- **Wearable Data Layer sync (`PapillonWearDataListenerService`)**: Real-time
  synchronization with the `papillon-wear` Expo module on the phone

The `with-wear-os` Expo config plugin restores `native/wear` into `android/wear`
and registers `include ':wear'` in `android/settings.gradle` automatically at
the end of every Android prebuild.

After changing live files inside `android/wear`, update the snapshots with:

```sh
bun run wear:native:snapshot
```

To restore `android/wear` without running prebuild, use:

```sh
bun run wear:native:restore
```
