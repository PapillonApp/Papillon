import type { Screen } from "@/router/helpers/types";
import defaultPersonalization from "@/services/local/default-personalization";
import { AccountService, type LocalAccount } from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import { user_by_username, login_check, get_user_profile } from "pawnilim";
import { View } from "react-native";
import WebView from "react-native-webview";
import { useRef } from "react";
import { useAccounts, useCurrentAccount } from "@/stores/account";

const UnivLimoges_Login: Screen<"UnivLimoges_Login"> = ({ navigation }) => {
  const createStoredAccount = useAccounts(store => store.create);
  const switchTo = useCurrentAccount(store => store.switchTo);

  const handleLogin = async (tokens: {
    accessToken: string
    refreshToken: string
    idTokenPayload: { sub: string }
  }) => {
    try {
      const username = tokens.idTokenPayload.sub;

      const { token } = await login_check(tokens.accessToken);
      const user = await user_by_username(token, username);
      const properties = await get_user_profile(token, username);
      const title = properties.find((property) => property.id === 9)?.value;

      const local_account: LocalAccount = {
        authentication: undefined,
        instance: undefined,

        identityProvider: {
          identifier: "univ-limoges",
          name: "Université de Limoges",
          rawData: { tokens, user, properties }
        },

        localID: uuid(),
        service: AccountService.Local,

        isExternal: false,
        linkedExternalLocalIDs: [],

        name: user.lastname + " " + user.firstname,
        studentName: {
          first: user.firstname,
          last: user.lastname,
        },
        className: title,
        schoolName: "Université de Limoges",

        personalization: await defaultPersonalization({
          profilePictureB64: user.avatar
        })
      };

      createStoredAccount(local_account);
      switchTo(local_account);

      queueMicrotask(() => {
        // Reset the navigation stack to the "Home" screen.
        // Prevents the user from going back to the login screen.
        navigation.reset({
          index: 0,
          routes: [{ name: "AccountCreated" }],
        });
      });
    }
    catch (error) {
      console.error(error);
    }
  };

  const webViewRef = useRef<WebView>(null);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <WebView
        source={{ uri: "https://biome.unilim.fr" }}
        style={{
          height: "100%",
          width: "100%",
        }}
        ref={webViewRef}
        startInLoadingState={true}
        incognito={true}
        onLoadEnd={(e) => {
          if (e.nativeEvent.url.includes("biome.unilim.fr")) {
            webViewRef.current?.injectJavaScript(`
              let interval = setInterval(() => {
                const tokens = sessionStorage.getItem("oidc.default:https://biome.unilim.fr/authentication/callback");
                if (tokens) {
                  window.ReactNativeWebView.postMessage(tokens);
                  clearInterval(interval);
                }
              }, 100);
            `);
          }
        }}

        onMessage={(e) => {
          if (typeof e.nativeEvent.data !== "string") return;
          const data = JSON.parse(e.nativeEvent.data);

          if (data && typeof data === "object" && "tokens" in data)
            handleLogin(data.tokens);
        }}
      />
    </View>
  );
};

export default UnivLimoges_Login;
