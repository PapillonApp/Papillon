import { Identification, qrPay } from "ezly";
import { QRCode, QRType } from "../shared/canteen";

export function fetchIzlyQRCode(accountId: string, session: Identification): QRCode {
  const qr = qrPay(session);
  return {
    type: QRType.QRCode,
    data: qr,
    createdByAccount: accountId
  }
}