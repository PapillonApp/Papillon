import createScreen from "@/router/helpers/create-screen";

import AccountSelector from "@/views/welcome/AccountSelector";
import FirstInstallation from "@/views/welcome/FirstInstallation";
import ColorSelector from "@/views/welcome/ColorSelector";
import DevMenu from "@/views/welcome/DevMenu";
import AccountCreated from "@/views/welcome/AccountCreated";
import ChangelogScreen from "@/views/welcome/ChangelogScreen";

export default [
  createScreen("AccountSelector", AccountSelector, {
    headerTransparent: true,
    headerBackVisible: false,
    headerTitle: "",
    animation: "fade",
  }),
  createScreen("FirstInstallation", FirstInstallation, {
    headerTransparent: true,
    headerBackVisible: false,
    headerTitle: "",
    animation: "simple_push",
  }),
  createScreen("DevMenu", DevMenu, {
    headerTitle: "Développement",
    animation: "slide_from_right",
  }),
  createScreen("ColorSelector", ColorSelector, {
    headerTransparent: true,
    headerBackVisible: false,
    headerTitle: "",
    animation: "slide_from_right",
  }),
  createScreen("AccountCreated", AccountCreated, {
    headerTransparent: true,
    headerBackVisible: false,
    headerTitle: "",
    animation: "slide_from_right",
  }),
  createScreen("ChangelogScreen", ChangelogScreen, {
    headerTitle: "Quoi de neuf ?",
    presentation: "modal",
    headerLargeTitle: true,
    animation: "slide_from_right",
  }),
] as const;
