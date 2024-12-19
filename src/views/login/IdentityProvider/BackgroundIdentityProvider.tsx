import { useCurrentAccount } from "@/stores/account";
import { Screen } from "@/router/helpers/types";
import { useEffect } from "react";

const BackgroundIdentityProvider: Screen<"BackgroundIdentityProvider"> = ({ route, navigation }) => {
  const account = useCurrentAccount(store => store.account);

  useEffect(() => {
    if(!account) {
      navigation.goBack();
    }

    const identityProvider = account!.identityProvider;

    if(identityProvider) {
      const { identifier, rawData } = identityProvider;

      if(identifier === "iut-lannion") {
        navigation.goBack();
        navigation.navigate("BackgroundIUTLannion");
      }
      else {
        navigation.goBack();
      }
    }
    else {
      navigation.goBack();
    }
  }, [account]);

  return null;
};

export default BackgroundIdentityProvider;