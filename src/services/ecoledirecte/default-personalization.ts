import type { Personalization } from "@/stores/account/types";
import downloadAsBase64 from "@/utils/external/download-as-base64";
import { defaultTabs } from "@/consts/DefaultTabs";
import type { Account } from "pawdirecte";
import AsyncStorage from "@react-native-async-storage/async-storage";

import colors from "@/utils/data/colors.json";

const defaultEDTabs = [
  "Home",
  "Lessons",
  "Homeworks",
  "Grades",
  "News",
  "Attendance",
  "Messages",
] as typeof defaultTabs[number]["tab"][];

export default async function defaultPersonalization (account: Account): Promise<Partial<Personalization>> {

  // Store the profile picture in the async storage
  AsyncStorage.setItem("defaultProfilePictureB64", await downloadAsBase64(account.profile_picture_url ?? ""));

  return {
    color: colors[0],
    magicEnabled: true,
    profilePictureB64: account.profile_picture_url
      ? await downloadAsBase64(account.profile_picture_url, {
        Referer: ".ecoledirecte.com/",
        Pragma: "no-cache"
      })
      : void 0,
    tabs: defaultTabs.filter(current => defaultEDTabs.includes(current.tab)).map((tab, index) => ({
      name: tab.tab,
      enabled: index <= 4
    }))
  };
}
