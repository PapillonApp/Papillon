import { AccountService, type ExternalAccount } from "@/stores/account/types";

export const qrcodeFromExternal = async (account: ExternalAccount): Promise<string | null> => {
  switch (account.service) {
    case AccountService.Turboself: {
      const { getQRCode } = await import("./turboself/qrcode");
      return getQRCode(account);
    }
    case AccountService.ARD: {
      // TODO: Implement ARD
      return null;
    }
    case AccountService.Izly: {
      const { getQRCode } = await import("./izly/qrcode");
      return getQRCode(account);
    }
    default:
      return null;
  }
};