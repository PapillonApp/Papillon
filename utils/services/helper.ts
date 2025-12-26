import { Services } from "@/stores/account/types";
import { ImageSourcePropType } from "react-native";

export function getServiceName(service: Services): string {
  switch(service) {
    case Services.TURBOSELF:
      return "TurboSelf";
    case Services.ARD:
      return "ARD";
    case Services.IZLY:
      return "Izly";
    case Services.ALISE:
      return "Alise";
    case Services.ECOLEDIRECTE:
      return "ÉcoleDirecte";
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
    case Services.IZLY:
      return require("@/assets/images/izly.png")
    case Services.ECOLEDIRECTE:
      return require("@/assets/images/ecoledirecte.png")
    case Services.ALISE:
      return require("@/assets/images/alise.jpg")
    default: 
      return require("@/assets/images/turboself.png")
  }
}

export function getServiceBackground(service: Services): ImageSourcePropType {
  switch(service) {
    case Services.TURBOSELF:
      return require("@/assets/images/turboself_background_card.png")
    case Services.IZLY:
      return require("@/assets/images/izly_background_card.png")
    case Services.ARD:
      return require("@/assets/images/ard_background_card.png")
    case Services.ECOLEDIRECTE:
      return require("@/assets/images/card_background/ecoledirecte.png")
    case Services.ALISE:
      return require("@/assets/images/alise_background_card.png")
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
    case Services.ECOLEDIRECTE:
      return "#108ED1"
    case Services.ALISE:
      return "#108ED1"
    default:
      return "#E70026"
  }
}

export function getCodeType(service: Services): string {
  switch(service) {
    case Services.ECOLEDIRECTE:
      return "CODE39"
    default:
      return "QR"
  }
}

export function isSelfModuleEnabledED(additionals?: Record<string, any>): boolean {
  if (!additionals) return false;
  for (const module of additionals["modules"] as Array<{badge: number, code: string, enable: true, ordre: number, params: Array<any>}>) {
    if (module.code === "CANTINE_BARCODE" && module.enable) {
      if (module.params && module.params.numeroBadge)
        return true;
    }
  }
  return false;
}