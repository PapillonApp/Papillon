import type { Personalization } from "@/stores/account/types";
import downloadAsBase64 from "@/utils/external/download-as-base64";
import { defaultTabs } from "@/consts/DefaultTabs";
import type pronote from "pawnote";

import colors from "@/utils/data/colors.json";

const defaultPronoteTabs = [
  "Home",
  "Lessons",
  "Homeworks",
  "Grades",
  "News",
  "Attendance",
  "Messages",
  "Menu"
] as typeof defaultTabs[number]["tab"][];

const defaultPersonalization = async (instance: pronote.SessionHandle): Promise<Partial<Personalization>> => {
  const user = instance.user.resources[0];
  return {
    color: colors[0],
    MagicHomeworks: true,
    MagicNews: true,
    profilePictureB64: user.profilePicture
      ? await downloadAsBase64(user.profilePicture.url)
      : void 0,

    tabs: defaultTabs.filter(current => defaultPronoteTabs.includes(current.tab)).map((tab, index) => ({
      name: tab.tab,
      enabled: index <= 4
    }))
  };
};

export default defaultPersonalization;
