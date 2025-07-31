import { AccountService } from "@/stores/account/types";

export const defaultProfilePicture = (service: AccountService, accountProvider?: string) => {
  switch (accountProvider) {
    case "Université de Rennes":
      return require("../../../assets/images/service_rennes1.png");
    case "IUT de Lannion":
      return require("../../../assets/images/service_rennes1.png");
    case "Université de Rennes 2":
      return require("../../../assets/images/service_rennes2.png");
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
    case AccountService.Izly:
      return require("../../../assets/images/service_izly.png");
    case AccountService.Turboself:
      return require("../../../assets/images/service_turboself.png");
    case AccountService.ARD:
      return require("../../../assets/images/service_ard.png");
    case AccountService.Alise:
      return require("../../../assets/images/service_alise.jpg");
    case AccountService.PapillonMultiService:
      return require("../../../assets/images/multiservice.png");
  }

  return require("../../../assets/images/service_unknown.png");
};
