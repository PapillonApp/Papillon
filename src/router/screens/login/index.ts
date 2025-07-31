import createScreen from "@/router/helpers/create-screen";

import pronote from "./pronote";
import ecoledirecte from "./ecoledirecte";
import ServiceSelector from "@/views/login/ServiceSelector";
import skolengo from "./skolengo";
import identityProvider from "./identityProvider";
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
  ...ecoledirecte,
  ...skolengo,
  ...identityProvider,
] as const;
