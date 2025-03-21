import downloadAsBase64 from "@/utils/external/download-as-base64";
import {
  AccountService,
  PrimaryAccount
} from "@/stores/account/types";
import { error, warn } from "@/utils/logger/logger";

// Depending on your account type, download the default profile photo
export async function getDefaultProfilePicture (
  account: PrimaryAccount): Promise<string | undefined> {
  try {
    switch (account.service) {
      case AccountService.Pronote: {
        const user = account.instance?.user?.resources?.[0];
        return user?.profilePicture
          ? await downloadAsBase64(user.profilePicture.url)
          : undefined;
      }
      case AccountService.Skolengo:
        warn("Skolengo does not provide a profile picture.", "getDefaultProfilePicture");
        return undefined; // Skolengo does not provide profile pictures

      case AccountService.EcoleDirecte:
        return account.profilePictureURL
          ? await downloadAsBase64(account.profilePictureURL, {
            Referer: ".ecoledirecte.com/",
            Pragma: "no-cache",
          })
          : undefined;

      default:
        return undefined;
    }
  } catch (err) {
    error("Error while retrieving default profile picture:" + err, "getDefaultProfilePicture");
    return undefined; // Return undefined in case of error
  }
}
