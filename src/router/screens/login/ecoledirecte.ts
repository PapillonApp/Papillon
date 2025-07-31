import createScreen from "@/router/helpers/create-screen";

import EcoleDirecteCredentials from "@/views/login/ecoledirecte/EcoleDirecteCredentials";

export default [
  createScreen("EcoleDirecteCredentials", EcoleDirecteCredentials, {
    headerTitle: "Connexion à EcoleDirecte",
    headerBackVisible: true
  }),
] as const;
