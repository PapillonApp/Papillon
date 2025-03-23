import type { Personalization } from "@/stores/account/types";
import { defaultTabs } from "@/consts/DefaultTabs";

import colors from "@/utils/data/colors.json";

const defaultUphfTabs = [
  "Home",
  "Lessons",
  "News",
] as typeof defaultTabs[number]["tab"][];

const defaultPersonalization = async (): Promise<Partial<Personalization>> => {
  return {
    color: colors[0],
    magicEnabled: true,
    tabs: defaultTabs.filter((current) => defaultUphfTabs.includes(current.tab)).map((tab, index) => ({
      name: tab.tab,
      enabled: index <= 4
    }))
  };
};

export default defaultPersonalization;
