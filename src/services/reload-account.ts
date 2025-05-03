import NetInfo from "@react-native-community/netinfo";
import {type Account, AccountService} from "@/stores/account/types";
import {error, warn} from "@/utils/logger/logger";
import { Alert } from "react-native";
import { PapillonNavigation } from "@/router/refs";

export interface Reconnected<T extends Account> {
  instance: T["instance"]
  authentication: T["authentication"]
}

function navigateRecreatedAccount (account: Account) {
  const navigate = PapillonNavigation.current?.navigate;
  if (!navigate) {
    console.warn("No navigation available to navigate to the authentication selector.");
    return;
  }

  switch (account.service) {
    case AccountService.Pronote: {
      navigate("PronoteAuthenticationSelector");
      break;
    }
    case AccountService.Skolengo: {
      navigate("SkolengoAuthenticationSelector");
      break;
    }
    case AccountService.EcoleDirecte: {
      navigate("EcoleDirecteCredentials");
      break;
    }
    case AccountService.Turboself:
    case AccountService.Alise:
    case AccountService.ARD:
    case AccountService.Izly: {
      navigate("SettingStack", { screen: "ExternalAccountSelector" });
      break;
    }
  }

  return;
}

/**
 * Takes the service of the account and tries
 * to reload the instance of the service using the "authentication" values stored.
 *
 * Once the instance has been reloaded, we give the new values for further authentications.
 */
export async function reload <T extends Account> (account: T): Promise<Reconnected<T>> {
  const isOnline = await NetInfo.fetch().then(state => state.isConnected ?? false);

  try {
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
      case AccountService.Alise: {
        const { reload } = await import("./alise/reload");
        const auth = await reload(account);
        return { instance: undefined, authentication: auth };
      }
      case AccountService.ARD: {
        const { reload } = await import("./ard/reload");
        const instance = await reload(account);
        const balances = await instance.getOnlinePayments();
        return {
          instance,
          authentication: {
            ...account.authentication,
            balances
          }
        };
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
      case AccountService.PapillonMultiService: {
        warn("PapillonMultiService space should never be reloaded.", "multiservice");
      }
      default: {
        console.warn("Service not implemented");
        return { instance: undefined, authentication: undefined };
      }
    }
  } catch (ERRfatal) {
    error(`Unable to reload account, see => ${ERRfatal}`, "ACCOUNT");
    if (!isOnline) {
      Alert.alert(
        "Connexion impossible",
        "Impossible de te connecter à ton compte, car tu n'es pas connecté(e) à Internet"
      );
    } else {
      Alert.alert(
        "Erreur de connexion",
        "Pour corriger la connexion, la réinitialisation de ton compte est nécessaire (tes données pourront être récupérées).",
        [
          {
            text: "Annuler",
            style: "cancel"
          },
          {
            text: "Réinitialiser le compte",
            onPress: () => navigateRecreatedAccount(account),
          }
        ]
      );
    }

    return { instance: undefined, authentication: undefined };
  }
}
