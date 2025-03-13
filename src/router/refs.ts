import { NavigationContainerRef } from "@react-navigation/native";
import { createRef } from "react";
import { RouteParameters } from "./helpers/types";
export const PapillonNavigation =
  createRef<NavigationContainerRef<RouteParameters>>();
