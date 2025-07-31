import createScreen from "@/router/helpers/create-screen";

import pronote from "./pronote";
import ServiceSelector from "@/views/login/ServiceSelector";
import { Platform } from "react-native";

export default [
  createScreen("ServiceSelector", ServiceSelector, {
    headerTitle: "",
    headerTransparent: true,
    headerBackVisible: true,
    animation: Platform.OS === "android" ? "slide_from_bottom" : undefined,
    animationDuration: 250,
  }),

  ...pronote,
] as const;
