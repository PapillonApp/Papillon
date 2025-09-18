import { Client } from "alise-api";
import { QRCode, QRType } from "../shared/canteen";

export async function fetchAliseQRCode(session: Client, accountId: string): Promise<QRCode> {
  const blob = await session.getBarcode();
  let data = "";
  if (blob) {
    data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  return {
    type: QRType.QRCode,
    data,
    createdByAccount: accountId
  };
}
