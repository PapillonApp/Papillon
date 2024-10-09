import createScreen from "@/router/helpers/create-screen";

import pronote from "./pronote";
import ecoledirecte from "./ecoledirecte";
import ServiceSelector from "@/views/login/ServiceSelector";
import skolengo from "./skolengo";
import identityProvider from "./identityProvider";

export default [
  createScreen("ServiceSelector", ServiceSelector, {
    headerTitle: "",
    headerTransparent: true,
    headerBackVisible: true,
    animation: "slide_from_bottom",
    animationDuration: 250
  }),

  ...pronote,
  ...ecoledirecte,
  ...skolengo,
  ...identityProvider
] as const;
