import * as FileSystem from "expo-file-system";

export default async function saveFile (fileName: string, fileContent: string) {
  await FileSystem.writeAsStringAsync(`${FileSystem.cacheDirectory}${fileName}`, fileContent, { encoding: "base64" });
  console.log(`${FileSystem.cacheDirectory}${fileName}`);
}