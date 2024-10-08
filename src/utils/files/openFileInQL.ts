import { NativeModules } from "react-native";
import { cacheDirectory } from "expo-file-system";

export default async function openFileInQL (fileName: string) {
  await NativeModules.FilePreviewManager.openFile(cacheDirectory + fileName);
}