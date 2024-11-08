import {AccountService, type ExternalAccount} from "@/stores/account/types";

export const qrcodeFromExternal = async (account: ExternalAccount): Promise<string | null> => {
  switch (account.service) {
    case AccountService.Turboself: {
      const { getQRCode } = await import("./turboself/qrcode");
      return await getQRCode(account);
    }
    case AccountService.ARD: {
      // TODO: Implement ARD
      return "0";
    }
    case AccountService.Izly: {
      const { getQRCode } = await import("./izly/qrcode");
      return await getQRCode(account);
    }
    default: {
      return "0";
    }
  }
};