# Protected iOS files

Expo prebuild owns the generated `ios` directory and can recreate it. The files
in this directory are the versioned source of truth for the native files that
Papillon must preserve:

- `Podfile`
- `ci_scripts/ci_post_clone.sh`

The `with-ios-native-files` Expo config plugin restores them automatically at
the end of every iOS prebuild, including a clean prebuild.

After intentionally changing either live file, update the snapshots with:

```sh
bun run ios:native:snapshot
```

To recover them without running prebuild, use:

```sh
bun run ios:native:restore
```
