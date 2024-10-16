import type { Personalization } from "@/stores/account/types";
import downloadAsBase64 from "@/utils/external/download-as-base64";
import { defaultTabs } from "@/consts/DefaultTabs";
import type { Account } from "pawdirecte";

import colors from "@/utils/data/colors.json";

const defaultLocalTabs = [
  "Home",
  "Lessons",
  "Homeworks",
  "Grades",
  "News",
  "Attendance",
  "Messages",
  "Menu"
] as typeof defaultTabs[number]["tab"][];

export default async function defaultPersonalization (customDefaults?: Partial<Personalization>): Promise<Partial<Personalization>> {
  return {
    color: colors[0],
    MagicHomeworks: true,
    MagicNews: true,
    profilePictureB64: undefined,
    tabs: defaultTabs.filter(current => defaultLocalTabs.includes(current.tab)).map((tab, index) => ({
      name: tab.tab,
      enabled: index <= 4
    })),
    ...customDefaults
  };
}

export function getProfileColorByName (name: string): { bright: string, dark: string } {
  const colors = [
    {
      bright: "#ED99BD",
      dark: "#91003F"
    },
    {
      bright: "#99D6ED",
      dark: "#006A91"
    },
    {
      bright: "#C6E4B1",
      dark: "#3C9100"
    },
    {
      bright: "#F6E4AF",
      dark: "#BF8F00"
    },
    {
      bright: "#D0BDE9",
      dark: "#5814AB"
    }
  ];
  return colors[name.length % colors.length];
}