import type { Screen } from "@/router/helpers/types";
import defaultPersonalization from "@/services/local/default-personalization";
import { AccountService, type LocalAccount } from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import { user_by_username, login_check, get_user_profile } from "pawnilim";
import { View } from "react-native";
import WebView from "react-native-webview";
import { useRef, useState } from "react";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { useTheme } from "@react-navigation/native";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { NativeText } from "@/components/Global/NativeComponents";
import { log } from "@/utils/logger/logger";
import { useAlert } from "@/providers/AlertProvider";
import { BadgeX, Check } from "lucide-react-native";

const UnivLimoges_Login: Screen<"UnivLimoges_Login"> = ({ navigation }) => {
  const createStoredAccount = useAccounts(store => store.create);
  const switchTo = useCurrentAccount(store => store.switchTo);
  const theme = useTheme();

  const { showAlert } = useAlert();
  const [isLoading, setLoading] = useState(true);

  let currentLoginStateIntervalRef = useRef<ReturnType<
    typeof setInterval
  > | null>(null);

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
        }),
        identity: {},
        serviceData: {},
        providers: []
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
      showAlert({
        title: "Erreur lors de la connexion",
        message: "Une erreur est survenue lors de la connexion à ton compte Biome, réessaye plus tard.",
        icon: <BadgeX />,
        actions: [
          {
            title: "OK",
            icon: <Check />,
            primary: true,
            onPress: () => navigation.goBack()
          },
        ],
      });
    }
  };

  const webViewRef = useRef<WebView>(null);
  const BIOME_ORIGIN = "https://biome.unilim.fr";
  const CAS_ORIGIN = "https://cas.unilim.fr";

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.card,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            gap: 6,
          }}
        >
          <PapillonSpinner
            size={48}
            strokeWidth={5}
            color="#29947a"
            style={{
              marginBottom: 16,
              marginHorizontal: 26,
            }}
          />

          <NativeText variant="title" style={{textAlign: "center"}}>
            Connexion au compte Biome
          </NativeText>

          <NativeText variant="subtitle" style={{textAlign: "center"}}>
            Chargement de Biome...
          </NativeText>
        </View>
      )}

      <WebView
        ref={webViewRef}
        style={{
          height: "100%",
          width: "100%",
        }}
        userAgent="Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
        source={{ uri: BIOME_ORIGIN }}
        setSupportMultipleWindows={false}
        startInLoadingState={true}
        incognito={true}
        onLoadStart={(e) => {
          log("start " + e.nativeEvent.url, "biome-login");

          if (e.nativeEvent.url.includes(BIOME_ORIGIN))
            setLoading(true);
          else if (e.nativeEvent.url.includes(CAS_ORIGIN))
            setLoading(false);
        }}
        onLoadEnd={(e) => {
          log("end " + e.nativeEvent.url, "biome-login");

          if (currentLoginStateIntervalRef.current)
            clearInterval(currentLoginStateIntervalRef.current);

          if (e.nativeEvent.url.includes(BIOME_ORIGIN)) {
            setLoading(true);

            currentLoginStateIntervalRef.current = setInterval(() => {
              log("injecting script...", "biome-login");

              webViewRef.current?.injectJavaScript(`
                const tokens = sessionStorage.getItem("oidc.default:https://biome.unilim.fr/authentication/callback");
                if (tokens) window.ReactNativeWebView.postMessage(tokens);
              `);
            }, 500);
          }
          else if (e.nativeEvent.url.includes("cas.unilim.fr")) {
            setLoading(false);
          }
        }}
        onMessage={(e) => {
          log(e.nativeEvent.data, "biome-login");

          if (typeof e.nativeEvent.data !== "string") return;
          const data = JSON.parse(e.nativeEvent.data);

          if (data && typeof data === "object" && data.tokens && data.tokens?.idTokenPayload) {
            if (currentLoginStateIntervalRef.current)
              clearInterval(currentLoginStateIntervalRef.current);

            handleLogin(data.tokens);
          }
        }}
      />
    </View>
  );
};

export default UnivLimoges_Login;
