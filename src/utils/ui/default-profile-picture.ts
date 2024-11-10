import { AccountService } from "@/stores/account/types";

export const defaultProfilePicture = (service: AccountService, accountProvider: string) => {
  switch (accountProvider) {
    case "Université de Rennes":
      return require("../../../assets/images/service_rennes1.png");
    case "IUT de Lannion":
      return require("../../../assets/images/service_rennes1.png");
    case "Université de Rennes 2":
      return require("../../../assets/images/service_rennes2.png");
    case "Université de Limoges":
      return require("../../../assets/images/service_unilim.png");
    case "Université Sorbonne Paris Nord":
      return require("../../../assets/images/service_uspn.png");
  }

  switch (service) {
    case AccountService.Pronote:
      return require("../../../assets/images/service_pronote.png");
    case AccountService.EcoleDirecte:
      return require("../../../assets/images/service_ed.png");
    case AccountService.Skolengo:
      return require("../../../assets/images/service_skolengo.png");
    case AccountService.Local:
      return require("../../../assets/images/service_unknown.png");
  }

  return require("../../../assets/images/service_unknown.png");
};