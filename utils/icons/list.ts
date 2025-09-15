/* eslint-disable @typescript-eslint/no-require-imports */
import { Colors } from "../colors";

export const AppIcons = {
  Dynamics: [
    {
      name: "Originale",
      iconName: "",
      icons: {
        [Colors.GREEN]: require("@/assets/appicons/flat_icon_green.png"),
        [Colors.PINK]: require("@/assets/appicons/flat_icon_pink.png"),
        [Colors.YELLOW]: require("@/assets/appicons/flat_icon_orange.png"),
        [Colors.BLUE]: require("@/assets/appicons/flat_icon_blue.png"),
        [Colors.PURPLE]: require("@/assets/appicons/flat_icon_purple.png"),
        [Colors.BLACK]: require("@/assets/appicons/flat_icon_black.png")
      }
    },
    {
      name: "3D",
      iconName: "3d",
      icons: {
        [Colors.GREEN]: require("@/assets/appicons/3d_green.png"),
        [Colors.PINK]: require("@/assets/appicons/3d_pink.png"),
        [Colors.YELLOW]: require("@/assets/appicons/3d_orange.png"),
        [Colors.BLUE]: require("@/assets/appicons/3d_blue.png"),
        [Colors.PURPLE]: require("@/assets/appicons/3d_purple.png"),
        [Colors.BLACK]: require("@/assets/appicons/3d_black.png")
      }
    },
    {
      name: "Découpe",
      iconName: "Cutted",
      icons: {
        [Colors.GREEN]: require("@/assets/appicons/cutted_green.png"),
        [Colors.PINK]: require("@/assets/appicons/cutted_pink.png"),
        [Colors.YELLOW]: require("@/assets/appicons/cutted_orange.png"),
        [Colors.BLUE]: require("@/assets/appicons/cutted_blue.png"),
        [Colors.PURPLE]: require("@/assets/appicons/cutted_purple.png"),
        [Colors.BLACK]: require("@/assets/appicons/cutted_black.png")
      }
    },
    {
      name: "Rayons",
      iconName: "Rays",
      icons: {
        [Colors.GREEN]: require("@/assets/appicons/rays_green.png"),
        [Colors.PINK]: require("@/assets/appicons/rays_pink.png"),
        [Colors.YELLOW]: require("@/assets/appicons/rays_orange.png"),
        [Colors.BLUE]: require("@/assets/appicons/rays_blue.png"),
        [Colors.PURPLE]: require("@/assets/appicons/rays_purple.png"),
        [Colors.BLACK]: require("@/assets/appicons/rays_black.png")
      }
    },
    {
      name: "Dégradé",
      iconName: "Gradient",
      icons: {
        [Colors.GREEN]: require("@/assets/appicons/gradent_green.png"),
        [Colors.PINK]: require("@/assets/appicons/gradent_pink.png"),
        [Colors.YELLOW]: require("@/assets/appicons/gradent_orange.png"),
        [Colors.BLUE]: require("@/assets/appicons/gradent_blue.png"),
        [Colors.PURPLE]: require("@/assets/appicons/gradent_purple.png"),
        [Colors.BLACK]: require("@/assets/appicons/gradent_black.png")
      }
    },
    {
      name: "Lignes",
      iconName: "Stroke",
      icons: {
        [Colors.GREEN]: require("@/assets/appicons/stroke_green.png"),
        [Colors.PINK]: require("@/assets/appicons/stroke_pink.png"),
        [Colors.YELLOW]: require("@/assets/appicons/stroke_orange.png"),
        [Colors.BLUE]: require("@/assets/appicons/stroke_blue.png"),
        [Colors.PURPLE]: require("@/assets/appicons/stroke_purple.png"),
        [Colors.BLACK]: require("@/assets/appicons/stroke_black.png")
      }
    }
  ]
};