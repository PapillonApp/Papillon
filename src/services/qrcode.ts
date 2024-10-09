import { AccountService, type ExternalAccount } from "@/stores/account/types";
import type { Balance } from "./shared/Balance";

export const qrcodeFromExternal = async (account: ExternalAccount): Promise<number> => {
  switch (account.service) {
    case AccountService.Turboself: {
      const { getQRCode } = await import("./turboself/qrcode");
      const QRCode = await getQRCode(account);
      return QRCode;
    }
    case AccountService.ARD: {
      // TODO: Implement ARD
      return 0;
    }
    default: {
      return 0;
    }
  }
};