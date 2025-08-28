import { Services } from "@/stores/account/types";
import { ImageSourcePropType } from "react-native";

export function getServiceName(service: Services): string {
  switch(service) {
    case Services.TURBOSELF:
      return "TurboSelf";
    case Services.ARD:
      return "ARD";
    default:
      return "Pronote";
  }
}

export function getServiceLogo(service: Services): ImageSourcePropType {
  switch(service) {
    case Services.TURBOSELF:
      return require("@/assets/images/turboself.png")
    case Services.ARD:
      return require("@/assets/images/ard.png")
    default: 
      return require("@/assets/images/turboself.png")
  }
}

export function getServiceBackground(service: Services): ImageSourcePropType {
  switch(service) {
    case Services.TURBOSELF:
      return require("@/assets/images/turboself_background_card.png")
    default: 
      return require("@/assets/images/ard_background_card.png")
  }
}

export function getServiceColor(service: Services): string {
  switch(service) {
    case Services.TURBOSELF:
      return "#E70026"
    case Services.ARD:
      return "#295888"
    default:
      return "#E70026"
  }
}