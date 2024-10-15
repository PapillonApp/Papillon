import type { Personalization, UphfAccount } from "@/stores/account/types";
import { defaultTabs } from "@/consts/DefaultTabs";
import type pronote from "pawnote";

import colors from "@/utils/data/colors.json";

const defaultUphfTabs = [
  "Home",
  "Lessons",
  "News",
] as typeof defaultTabs[number]["tab"][];

const defaultPersonalization = async (instance: UphfAccount["instance"]): Promise<Partial<Personalization>> => {
  const profilePictureAsBase64 = await instance?.getProfilePictureAsBase64();
  return {
    color: colors[0],
    magicEnabled: true,
    profilePictureB64: (profilePictureAsBase64 !== null && profilePictureAsBase64 != "")
      ? await profilePictureAsBase64
      : void 0,
    tabs: defaultTabs.filter(current => defaultUphfTabs.includes(current.tab)).map((tab, index) => ({
      name: tab.tab,
      enabled: index <= 4
    }))
  };
};

export default defaultPersonalization;
