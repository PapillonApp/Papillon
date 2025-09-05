import { Client } from "turboself-api";

import { QRCode, QRType } from "../shared/canteen";

export function fetchTurboSelfQRCode(session: Client, accountId: string): QRCode {
  if (session.host?.cardNumber) {
    return {
      type: QRType.QRCode,
      data: String(session.host.cardNumber),
      createdByAccount: accountId
    };
  }
	
  return {
    type: QRType.QRCode,
    data: "",
    createdByAccount: accountId
  }
}