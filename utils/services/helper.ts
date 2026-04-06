import { ImageSourcePropType } from "react-native";

import { Balance } from "@/services/shared/balance";
import { Services } from "@/stores/account/types";

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
  case Services.LANNION:
    return "IUT de Lannion";
  default:
    return "Pronote";
  }
}

export function getServiceLogo(service: Services): ImageSourcePropType {
  switch(service) {
  case Services.PRONOTE:
    return require("@/assets/images/service_pronote.png")
  case Services.SKOLENGO:
    return require("@/assets/images/service_skolengo.png")
  case Services.LANNION:
    return require("@/assets/images/univ_lannion.png")
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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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
  if (!additionals) {
    return false;
  }

  const rawModules = additionals["edModules"] ?? additionals["modules"];
  const modules = typeof rawModules === "string"
    ? safelyParseModules(rawModules)
    : Array.isArray(rawModules)
      ? rawModules
      : [];

  return modules.some((module) => {
    const badgeNumber = typeof module?.params?.numeroBadge === "string"
      ? module.params.numeroBadge.trim()
      : "";
    return module?.code === "CANTINE_BARCODE" && module?.enable && badgeNumber.length > 0;
  });
}

export function isQRCodeOnlyWallet(
  service: Services,
  wallet: Balance
): boolean {
  return service === Services.ECOLEDIRECTE && wallet.currency.trim().length === 0;
}

export function getWalletDisplayLabel(
  wallet: Balance,
  service: Services
): string {
  if (isQRCodeOnlyWallet(service, wallet)) {
    return wallet.label || "Badge cantine";
  }

  return wallet.label;
}

export function getWalletDisplayAmount(
  wallet: Balance,
  service: Services
): string {
  if (isQRCodeOnlyWallet(service, wallet)) {
    return "QR uniquement";
  }

  return `${(wallet.amount / 100).toFixed(2)} ${wallet.currency}`.trim();
}

function safelyParseModules(rawModules: string): any[] {
  try {
    const parsedModules = JSON.parse(rawModules);
    return Array.isArray(parsedModules) ? parsedModules : [];
  } catch {
    return [];
  }
}