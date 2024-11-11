import {type Account, AccountService} from "@/stores/account/types";
export interface Reconnected<T extends Account> {
  instance: T["instance"]
  authentication: T["authentication"]
}

/**
 * Takes the service of the account and tries
 * to reload the instance of the service using the "authentication" values stored.
 *
 * Once the instance has been reloaded, we give the new values for further authentications.
 */
export async function reload <T extends Account> (account: T): Promise<Reconnected<T>> {
  switch (account.service) {
    case AccountService.Pronote: {
      const { reloadInstance } = await import("./pronote/reload-instance");
      return await reloadInstance(account.authentication) as Reconnected<T>;
    }
    case AccountService.Local: {
      return { instance: account.identityProvider.rawData || true, authentication: true };
    }
    case AccountService.Turboself: { // should be done automatically though
      const { reload } = await import("./turboself/reload");
      const auth = await reload(account);
      // keep instance the same
      return { instance: undefined, authentication: auth };
    }
    case AccountService.ARD: {
      const { reload } = await import("./ard/reload");
      const instance = await reload(account);
      return { instance, authentication: account.authentication };
    }
    case AccountService.Izly: {
      const { reload } = await import("./izly/reload");
      const instance = await reload(account);
      return { instance, authentication: account.authentication };
    }
    case AccountService.Skolengo: {
      const { reload } = await import("./skolengo/reload-skolengo");
      const res = await reload(account);
      return { instance: res.instance, authentication: res.authentication };
    }
    case AccountService.EcoleDirecte: {
      const { reload } = await import("./ecoledirecte/reload");
      const res = await reload(account);
      return { instance: res.instance, authentication: res.authentication };
    }
    case AccountService.Multi: {
      const { reloadInstance } = await import("./multi/reload-multi");
      return await reloadInstance(account.authentication) as Reconnected<T>;
    }
    default: {
      console.warn("Service not implemented");
      return { instance: undefined, authentication: undefined };
    }
  }
}
