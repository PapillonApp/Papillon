import React, { createRef, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  Text,
} from "react-native";

import { WebView } from "react-native-webview";
import type { Screen } from "@/router/helpers/types";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import MaskStars from "@/components/FirstInstallation/MaskStars";

import { School } from "scolengo-api/types/models/School";
import * as AuthSession from "expo-auth-session";
import { OID_CLIENT_ID, OID_CLIENT_SECRET, REDIRECT_URI } from "scolengo-api";
import { useAlert } from "@/providers/AlertProvider";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { authTokenToSkolengoTokenSet } from "@/services/skolengo/skolengo-types";
import { getSkolengoAccount } from "@/services/skolengo/skolengo-account";
import { wait } from "@/services/skolengo/data/utils";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import { BadgeX, Undo2 } from "lucide-react-native";

// TODO : When the app is not started with Expo Go (so with a prebuild or a release build), use the expo auth-session module completely with the deeplink and without the webview.

const SkolengoWebview: Screen<"SkolengoWebview"> = ({ route, navigation }) => {
  const { showAlert } = useAlert();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [showWebView, setShowWebView] = useState(false);

  const [loginStep, setLoginStep] = useState("Connexion aux services d'authentification de Skolengo...");

  const [pageUrl, setPageUrl] = useState<string|null>(null);
  const [discovery, setDiscovery] = useState<AuthSession.DiscoveryDocument | null>(null);
  const { playSound } = useSoundHapticsWrapper();
  const LEson = require("@/../assets/sound/3.wav");

  const createStoredAccount = useAccounts((store) => store.create);
  const switchTo = useCurrentAccount((store) => store.switchTo);

  useEffect(() => {
    getSkolengoURL(route.params.school).then((skourl) => {
      if(skourl) {
        setPageUrl(skourl.url);
        setDiscovery(skourl.discovery);
      }
    });

  }, [route.params.school]);

  let webViewRef = createRef<WebView>();

  useEffect(() => {
    playSound(LEson);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <MaskStars />
      <KeyboardAvoidingView behavior="padding">
        <View
          style={[
            {
              flex: 1,
              marginTop: Platform.OS === "ios" ? 46 : 56,
              marginBottom: 10,
              width: Dimensions.get("window").width - 20,
              borderRadius: 10,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
              shadowColor: theme.colors.border,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 1,
              shadowRadius: 0,
            },
            Platform.OS === "android" && {
              overflow: "hidden",
              elevation: 4,
            }
          ]}
        >
          {!showWebView && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 20,
                backgroundColor: theme.colors.card,
              }}
            >
              <ActivityIndicator
                size="large"
                color={theme.colors.text}
              />

              <Text
                style={{
                  color: theme.colors.text,
                  marginTop: 10,
                  fontSize: 18,
                  fontFamily: "semibold",
                  textAlign: "center",
                }}
              >
                Connexion à Skolengo
              </Text>

              <Text
                style={{
                  color: theme.colors.text,
                  marginTop: 6,
                  fontSize: 16,
                  lineHeight: 20,
                  fontFamily: "medium",
                  opacity: 0.5,
                  textAlign: "center",
                }}
              >
                {loginStep}
              </Text>
            </View>
          )}

          <WebView
            ref={webViewRef}
            style={[
              styles.webview,
              {
                width: "100%",
                height: "100%",
                opacity: showWebView ? 1 : 0,
                borderRadius: 10,
                borderCurve: "continuous",
                overflow: "hidden",
                zIndex: 1,
              },
            ]}
            onHttpError={() => setShowWebView(false)}
            onShouldStartLoadWithRequest={(e) => {
              if (e.url.startsWith("http://") || e.url.startsWith("https://")) {
                if (!showWebView) setShowWebView(true);
                return true;
              }

              if (e.url.includes(REDIRECT_URI)) {
                setShowWebView(false);
                const url = new URL(e.url);
                const code = url.searchParams.get("code");

                if (!code || !discovery) {
                  showAlert({
                    title: "Erreur",
                    message: "Impossible de récupérer le code d'authentification.",
                    icon: <BadgeX />,
                    actions: [
                      {
                        title: "OK",
                        primary: true,
                        icon: <Undo2 />,
                        onPress: () => navigation.goBack(),
                      }
                    ]
                  });

                  return false;
                }

                setLoginStep("Récupératon du token d'authentification...");
                AuthSession.exchangeCodeAsync(
                  {
                    clientId: OID_CLIENT_ID,
                    clientSecret: OID_CLIENT_SECRET,
                    code: code,
                    redirectUri: REDIRECT_URI,
                  },
                  discovery!
                ).then(async (token) => {
                  setLoginStep("Initialisation du compte...");
                  const newToken = authTokenToSkolengoTokenSet(token);

                  // Need that if the user have ressources from PRONOTE
                  await wait(1000);

                  setLoginStep("Obtention du compte...");
                  const skolengoAccount = await getSkolengoAccount({
                    school: route.params.school,
                    tokenSet: newToken,
                    discovery: discovery!
                  });

                  setLoginStep("Finalisation du compte...");
                  createStoredAccount(skolengoAccount);
                  switchTo(skolengoAccount);

                  // We need to wait a tick to make sure the account is set before navigating.
                  queueMicrotask(() => {
                    // Reset the navigation stack to the "Home" screen.
                    // Prevents the user from going back to the login screen.
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "AccountCreated" }],
                    });
                  });
                });
              }

              return true;
            }}
            source={{ uri: pageUrl || "" }}
            setSupportMultipleWindows={false}
            originWhitelist={["http://*", "https://*", "skoapp-prod://*"]}
            incognito={true} // Prevent to keep cookies on webview load.
            userAgent="Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
  },

  webview: {
    flex: 1,
  },
});

export default SkolengoWebview;

const getSkolengoURL =  async (school: School) => {
  try {
    const discovery = await fetch(school.emsOIDCWellKnownUrl!)
      .then((res) => res.json())
      .then((res) => res.issuer)
      .then((issuer) => AuthSession.resolveDiscoveryAsync(issuer));
    if (!discovery) return;
    const authRes = new AuthSession.AuthRequest({
      clientId: OID_CLIENT_ID,
      clientSecret: OID_CLIENT_SECRET,
      redirectUri: REDIRECT_URI,
      extraParams: {
        scope: "openid",
        response_type: "code",
      },
      usePKCE: false,
    });
    const url = await authRes.makeAuthUrlAsync(discovery);
    return {url, discovery, authRes};
  } catch (e) {
    console.error(e);
    return null;
  }
};

//! This function is not used in the current codebase but will be used in the future
const loginSkolengoWorkflow = async (school: School) => {
  const skolengoUrl = await getSkolengoURL(school);
  if(!skolengoUrl) return;
  const res = await skolengoUrl.authRes.promptAsync(skolengoUrl.discovery, {
    url: skolengoUrl.url,
  });
  if (!res || res?.type !== "success") return;
  const token = await AuthSession.exchangeCodeAsync(
    {
      clientId: OID_CLIENT_ID,
      clientSecret: OID_CLIENT_SECRET,
      code: res.params.code,
      redirectUri: REDIRECT_URI,
    },
    skolengoUrl.discovery
  );
  if (!token) return;
};