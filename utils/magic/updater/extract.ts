import * as FileSystem from "expo-file-system/legacy";
import { unzipSync } from "fflate";

import { log } from "@/utils/logger/logger";

import { ensureDir, readJSON } from "./fileUtils";

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {out[i] = bin.charCodeAt(i);}
  return out;
}
function bytesToBase64(u8: Uint8Array): string {
  let s = "";
  for (let i = 0; i < u8.length; i++) {s += String.fromCharCode(u8[i]);}
  return btoa(s);
}

async function listAllFiles(dirUri: string, relPrefix = ""): Promise<string[]> {
  const entries = await FileSystem.readDirectoryAsync(dirUri);
  const out: string[] = [];
  for (const name of entries) {
    const full = dirUri + name;
    const rel = relPrefix + name;
    const st = await FileSystem.getInfoAsync(full);
    if (st.isDirectory) {
      const sub = await listAllFiles(full + "/", rel + "/");
      out.push(...sub);
    } else {
      out.push(rel);
    }
  }
  return out;
}

async function normalizeStagingLayout(stagingDir: string) {
  const expected = await FileSystem.getInfoAsync(
    stagingDir + "model/model.tflite"
  );
  if (expected.exists) {return;}

  const all = await listAllFiles(stagingDir);
  log(`[EXTRACT] files: ${all.join(", ")}`);
  const tfliteRel = all.find(p => /\.tflite$/i.test(p));
  if (!tfliteRel) {
    return;
  }

  const tfliteDirRel = tfliteRel.split("/").slice(0, -1).join("/");
  const tfliteName = tfliteRel.split("/").pop()!;
  const srcDirUri = tfliteDirRel ? stagingDir + tfliteDirRel + "/" : stagingDir;

  const dstModelDir = stagingDir + "model/";
  await ensureDir(dstModelDir);

  await FileSystem.moveAsync({
    from: stagingDir + tfliteRel,
    to: dstModelDir + "model.tflite",
  });

  const maybe = ["tokenizer.json", "labels.json", "word_index.json", "index_word.json"];
  for (const f of maybe) {
    const src = srcDirUri + f;
    const info = await FileSystem.getInfoAsync(src);
    if (info.exists) {
      log(`[EXTRACT] Déplacement ${f}: ${src} -> ${dstModelDir + f}`);
      await FileSystem.moveAsync({ from: src, to: dstModelDir + f });
    } else {
      log(`[EXTRACT] Fichier manquant: ${f} (cherché dans ${src})`);
    }
  }
}

export async function extractMagicToStaging(
  magicUri: string,
  stagingDir: string
) {
  const st = await FileSystem.getInfoAsync(stagingDir);
  if (st.exists) {await FileSystem.deleteAsync(stagingDir, { idempotent: true });}
  await ensureDir(stagingDir);

  const b64 = await FileSystem.readAsStringAsync(magicUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const zipBytes = base64ToBytes(b64);
  const files = unzipSync(zipBytes);

  for (const [relOriginal, content] of Object.entries(files)) {
    const isDir =
      relOriginal.endsWith("/") ||
      relOriginal === "" ||
      relOriginal.endsWith("\\");
    if (isDir) {
      await ensureDir(stagingDir + relOriginal);
    } else {
      const parts = relOriginal.split("/").slice(0, -1);
      if (parts.length) {await ensureDir(stagingDir + parts.join("/") + "/");}
      await FileSystem.writeAsStringAsync(
        stagingDir + relOriginal,
        bytesToBase64(content),
        { encoding: FileSystem.EncodingType.Base64 }
      );
    }
  }

  await normalizeStagingLayout(stagingDir);
}

export async function validateExtractedTree(stagingDir: string) {
  const mustExist = [
    "model/model.tflite",
    "model/tokenizer.json",
    "model/labels.json",
    "metadata.json",
  ];
  for (const rel of mustExist) {
    const info = await FileSystem.getInfoAsync(stagingDir + rel);
    if (!info.exists) {throw new Error(`missing-file:${rel}`);}
  }
  const infos = await readJSON<unknown>(stagingDir + "metadata.json");
  return infos;
}
