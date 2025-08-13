import * as FileSystem from "expo-file-system";
import { unzipSync } from "fflate";
import { ensureDir, readJSON } from "./fileUtils";

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToBase64(u8: Uint8Array): string {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}

export async function extractMagicToStaging(
  magicUri: string,
  stagingDir: string
) {
  const st = await FileSystem.getInfoAsync(stagingDir);
  if (st.exists) await FileSystem.deleteAsync(stagingDir, { idempotent: true });
  await ensureDir(stagingDir);

  const b64 = await FileSystem.readAsStringAsync(magicUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const zipBytes = base64ToBytes(b64);
  const files = unzipSync(zipBytes);

  for (const [rel, content] of Object.entries(files)) {
    const isDir = rel.endsWith("/") || rel === "" || rel.endsWith("\\");
    const dest = stagingDir + rel;
    if (isDir) {
      await ensureDir(dest);
    } else {
      const parts = rel.split("/").slice(0, -1);
      if (parts.length) await ensureDir(stagingDir + parts.join("/") + "/");
      await FileSystem.writeAsStringAsync(dest, bytesToBase64(content), {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
  }
}

export async function validateExtractedTree(stagingDir: string) {
  const mustExist = [
    "model/model.tflite",
    "model/tokenizer.json",
    "model/labels.json",
    "infos.json",
  ];
  for (const rel of mustExist) {
    const info = await FileSystem.getInfoAsync(stagingDir + rel);
    if (!info.exists) throw new Error(`missing-file:${rel}`);
  }
  const infos = await readJSON<any>(stagingDir + "infos.json");
  return infos;
}
