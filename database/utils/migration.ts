import { Platform } from "react-native";
import RNFetchBlob from "rn-fetch-blob";
import { info, warn } from "@/utils/logger/logger";

export const migrateDatabase = async (): Promise<void> => {
  info("🍉 Checking for database migration...");
  if (Platform.OS === "ios") {
    const default_watermelon_path = `${RNFetchBlob.fs.dirs.DocumentDir}/watermelon.db`;
    // @ts-expect-error - This method exist.
    const appgroup_watermelon_path = `${RNFetchBlob.fs.syncPathAppGroup("group.xyz.getpapillon.ios")}/default.db`;

    if (
      appgroup_watermelon_path &&
      (await RNFetchBlob.fs.exists(default_watermelon_path))
    ) {
      info("🍉 Database not currently migrated. Migrating...");
      console.log(appgroup_watermelon_path);
      await RNFetchBlob.fs.mv(
        default_watermelon_path,
        appgroup_watermelon_path
      );
    } else if (typeof appgroup_watermelon_path === "undefined") {
      warn("🍉 Database cannot be migrated. App group is undefined.");
    }
  }
}