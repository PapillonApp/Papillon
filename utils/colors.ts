import { t } from "i18next";

export enum Colors {
  PINK,
  YELLOW,
  GREEN,
  PURPLE,
  BLUE,
  BLACK,
}

export const AppColors = [
  {
    mainColor: "#DD007D",
    backgroundColor: "#FAD9EC",
    nameKey: t("Colors.rose"),
    colorEnum: Colors.PINK,
  },
  {
    mainColor: "#E8B048",
    backgroundColor: "#FCF3E4",
    nameKey: t("Colors.yellow"),
    colorEnum: Colors.YELLOW,
  },
  {
    mainColor: "#26B290",
    backgroundColor: "#DEF3EE",
    nameKey: t("Colors.green"),
    colorEnum: Colors.GREEN,
  },
  {
    mainColor: "#C400DD",
    backgroundColor: "#F6D9FA",
    nameKey: t("Colors.purple"),
    colorEnum: Colors.PURPLE,
  },
  {
    mainColor: "#48B7E8",
    backgroundColor: "#E4F4FC",
    nameKey: t("Colors.blue"),
    colorEnum: Colors.BLUE,
  },
  {
    mainColor: "#6D6D6D",
    backgroundColor: "#E9E9E9",
    nameKey: t("Colors.black"),
    colorEnum: Colors.BLACK,
  },
];
