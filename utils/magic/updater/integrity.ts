import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";

export async function fileSha256Hex(uri: string): Promise<string> {
  const b64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {bytes[i] = bin.charCodeAt(i);}
  const digest = await Crypto.digest(
    Crypto.CryptoDigestAlgorithm.SHA256,
    bytes
  );
  return Array.from(new Uint8Array(digest as ArrayBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifySize(uri: string, expected: number) {
  const stat = await FileSystem.getInfoAsync(uri);
  if (!stat.exists) {throw new Error("file-missing");}
  if ((stat.size ?? -1) !== expected) {
    throw new Error(
      `size-mismatch expected=${expected} got=${stat.size ?? -1}`
    );
  }
}
