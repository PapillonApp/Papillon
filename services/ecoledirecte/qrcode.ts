import { Account } from "pawdirecte";

import { QRCode, QRType } from "@/services/shared/canteen";

export function fetchEDQRCode(account: Account): QRCode {
  for (const module of account.modules) {
    if (module.code === "CANTINE_BARCODE" && module.enable) {
      return {
        type: QRType.QRCode,
        data: module.params.numeroBadge,
        createdByAccount: String(account.id)
      }
    }
  }

  return {
    type: QRType.QRCode,
    data: "",
    createdByAccount: String(account.id)
  }
}