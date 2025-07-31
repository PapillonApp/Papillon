import type { EcoleDirecteAccount } from "@/stores/account/types";
import downloadAsBase64 from "@/utils/external/download-as-base64";

export const getFile = async (account: EcoleDirecteAccount, id: string, type: string) => {
  const b64Content = await downloadAsBase64(`https://api.ecoledirecte.com/v3/telechargement.awp?verbe=get&fichierId=${id}&leTypeDeFichier=${type}&v=6.17.0`, {
    "User-Agent": "EDMOBILE",
    "X-Token": account.authentication.session.token ?? "",
    "Content-Type": "application/x-www-form-urlencoded"
  }, "POST", { forceDownload: 0 });
  return b64Content.split("base64,")[1];
};