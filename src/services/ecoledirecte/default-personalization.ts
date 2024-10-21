import type { Personalization } from "@/stores/account/types";
import downloadAsBase64 from "@/utils/external/download-as-base64";
import { defaultTabs } from "@/consts/DefaultTabs";
import type { Account } from "pawdirecte";

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
  return {
    color: colors[0],
    MagicHomeworks: true,
    MagicNews: true,
    profilePictureB64: account.profilePictureURL
      ? await downloadAsBase64(account.profilePictureURL, {
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
