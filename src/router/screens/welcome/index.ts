import createScreen from "@/router/helpers/create-screen";

import AccountSelector from "@/views/welcome/AccountSelector";
import FirstInstallation from "@/views/welcome/FirstInstallation";
import ColorSelector from "@/views/welcome/ColorSelector";
import DevMenu from "@/views/welcome/DevMenu";
import AccountCreated from "@/views/welcome/AccountCreated";
import ChangelogScreen from "@/views/welcome/ChangelogScreen";
import ProfilePic from "@/views/welcome/ProfilePic";

export default [
  createScreen("AccountSelector", AccountSelector, {
    headerTransparent: true,
    headerBackVisible: false,
    headerTitle: "",
    animation: "fade",
    animationDuration: 300,
  }),
  createScreen("FirstInstallation", FirstInstallation, {
    headerTransparent: true,
    headerBackVisible: false,
    headerTitle: "",
  }),
  createScreen("DevMenu", DevMenu, {
    headerTitle: "Développement",
  }),
  createScreen("ColorSelector", ColorSelector, {
    headerTransparent: true,
    headerBackVisible: false,
    headerTitle: "",
  }),
  createScreen("ProfilePic", ProfilePic, {
    headerTransparent: true,
    headerBackVisible: false,
    headerTitle: "",
  }),
  createScreen("AccountCreated", AccountCreated, {
    headerTransparent: true,
    headerBackVisible: false,
    headerTitle: "",
  }),
  createScreen("ChangelogScreen", ChangelogScreen, {
    headerTitle: "Quoi de neuf ?",
    presentation: "modal",
    headerLargeTitle: true,
  }),
] as const;

