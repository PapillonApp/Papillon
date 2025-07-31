import createScreen from "@/router/helpers/create-screen";

import SkolengoAuthenticationSelector from "@/views/login/skolengo/SkolengoAuthenticationSelector";
import SkolengoGeolocation from "@/views/login/skolengo/SkolengoGeolocation";
import SkolengoInstanceSelector from "@/views/login/skolengo/SkolengoInstanceSelector";
import SkolengoWebview from "@/views/login/skolengo/SkolengoWebview";


export default [
  createScreen("SkolengoAuthenticationSelector", SkolengoAuthenticationSelector, {
    headerTitle: "",
    headerTransparent: true,
    headerBackVisible: true
  }),
  createScreen("SkolengoGeolocation", SkolengoGeolocation, {
    headerTitle: "",
    headerTransparent: true,
    headerBackVisible: true
  }),
  createScreen("SkolengoInstanceSelector", SkolengoInstanceSelector, {
    headerTitle: "",
    headerTransparent: true,
    headerBackVisible: true
  }),
  createScreen("SkolengoWebview", SkolengoWebview, {
    headerTitle: "",
    headerTransparent: true,
    headerBackVisible: true
  }),
] as const;
