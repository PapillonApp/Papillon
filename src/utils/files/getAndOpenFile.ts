import { getFile } from "@/services/ecoledirecte/getFile";
import type { EcoleDirecteAccount } from "@/stores/account/types";
import saveFile from "./saveFile";
import openFileInQL from "./openFileInQL";

export default async (account: EcoleDirecteAccount, fileSeed: string) => {
  const [name, id, type] = fileSeed.split("\\");
  const fileContent = await getFile(account, id, type);
  await saveFile(name, fileContent);
  await openFileInQL(name);
};