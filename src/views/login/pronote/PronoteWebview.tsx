import React, { createRef, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { WebView } from "react-native-webview";
import type { Screen } from "@/router/helpers/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import MaskStars from "@/components/FirstInstallation/MaskStars";

import Reanimated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  LinearTransition,
} from "react-native-reanimated";

import pronote from "pawnote";

import { useAccounts, useCurrentAccount } from "@/stores/account";
import { Account, AccountService } from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import defaultPersonalization from "@/services/pronote/default-personalization";
import extract_pronote_name from "@/utils/format/extract_pronote_name";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { animPapillon } from "@/utils/ui/animations";
import { useAlert } from "@/providers/AlertProvider";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import { BadgeInfo, Undo2 } from "lucide-react-native";

const PronoteWebview: Screen<"PronoteWebview"> = ({ route, navigation }) => {
  const theme = useTheme();
  const { showAlert } = useAlert();

  const [, setLoading] = useState(true);
  const [, setLoadProgress] = useState(0);
  const [showWebView, setShowWebView] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const [, setCurrentURL] = useState("");

  const [deviceUUID] = useState(uuid());

  const [loginStep, setLoginStep] = useState("Préparation de la connexion");

  const { playSound } = useSoundHapticsWrapper();
  const LEson3 = require("@/../assets/sound/3.wav");
  const LEson4 = require("@/../assets/sound/4.wav");

  const instanceURL = route.params.instanceURL.toLowerCase();

  const infoMobileURL =
    instanceURL + "/InfoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4";

  let webViewRef = createRef<WebView>();
  let currentLoginStateIntervalRef = useRef<ReturnType<
    typeof setInterval
  > | null>(null);

  const createStoredAccount = useAccounts((store) => store.create);
  const switchTo = useCurrentAccount((store) => store.switchTo);

  const PRONOTE_COOKIE_EXPIRED = new Date(0).toUTCString();
  const PRONOTE_COOKIE_VALIDATION_EXPIRES = new Date(
    new Date().getTime() + 5 * 60 * 1000
  ).toUTCString();
  const PRONOTE_COOKIE_LANGUAGE_EXPIRES = new Date(
    new Date().getTime() + 365 * 24 * 60 * 60 * 1000
  ).toUTCString();

  useEffect(() => {
    playSound(LEson3);
  }, []);

  const INJECT_PRONOTE_JSON = `
    (function () {
      try {
        const json = JSON.parse(document.body.innerText);
        const lJetonCas = !!json && !!json.CAS && json.CAS.jetonCAS;
        
        document.cookie = "appliMobile=; expires=${PRONOTE_COOKIE_EXPIRED}"

        if (!!lJetonCas) {
          document.cookie = "validationAppliMobile=" + lJetonCas + "; expires=${PRONOTE_COOKIE_VALIDATION_EXPIRES}";
          document.cookie = "uuidAppliMobile=${deviceUUID}; expires=${PRONOTE_COOKIE_VALIDATION_EXPIRES}";
          // 1036 = French
          document.cookie = "ielang=1036; expires=${PRONOTE_COOKIE_LANGUAGE_EXPIRES}";
        }

        window.location.assign("${instanceURL}/mobile.eleve.html?fd=1");
      }
      catch {
        // TODO: Handle error
      }
    })();
  `.trim();

  /**
   * Creates the hook inside the webview when logging in.
   * Also hides the "Download PRONOTE app" button.
   */
  const INJECT_PRONOTE_INITIAL_LOGIN_HOOK = `
    (function () {
      window.hookAccesDepuisAppli = function() {
        this.passerEnModeValidationAppliMobile('', '${deviceUUID}');
      };
      
      return '';
    })();
  `.trim();

  const INJECT_PRONOTE_CURRENT_LOGIN_STATE = `
    (function () {
      setInterval(function() {
        const state = window && window.loginState ? window.loginState : void 0;

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'pronote.loginState',
          data: state
        }));
      }, 1000);
    })();
  `.trim();

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
            },
          ]}
        >
          {!showWebView && (
            <Reanimated.View
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
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
            >
              <PapillonSpinner
                animated={true}
                size={48}
                color={theme.colors.primary}
                strokeWidth={6}
                entering={!showWebView && FadeInUp.duration(200)}
                exiting={FadeOutDown.duration(100)}
              />

              <Reanimated.Text
                style={{
                  color: theme.colors.text,
                  marginTop: 10,
                  fontSize: 18,
                  fontFamily: "semibold",
                  textAlign: "center",
                }}
                entering={!showWebView && FadeInUp.duration(200)}
                exiting={FadeOutDown.duration(100)}
                layout={animPapillon(LinearTransition)}
              >
                Connexion à Pronote
              </Reanimated.Text>

              <Reanimated.View
                layout={animPapillon(LinearTransition)}
                entering={!showWebView && FadeInUp.duration(200)}
                exiting={FadeOutDown.duration(100)}
                key={loginStep + "stp"}
              >
                <Reanimated.Text
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
                </Reanimated.Text>
              </Reanimated.View>
            </Reanimated.View>
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
            source={{ uri: infoMobileURL }}
            setSupportMultipleWindows={false}
            onLoadProgress={({ nativeEvent }) => {
              setLoadProgress(nativeEvent.progress);
            }}
            onError={(e) => {
              console.error("Pronote webview error", e);
            }}
            onLoadStart={(e) => {
              const { url } = e.nativeEvent;
              setCurrentURL(url);

              setLoading(true);

              if (url.includes("mobile.eleve.html")) {
                setLoginStep("En attente de ton établissement");
                setShowWebView(false);
              }
            }}
            onMessage={async ({ nativeEvent }) => {
              const message = JSON.parse(nativeEvent.data);

              if (message.type === "pronote.loginState") {
                if (loggingIn) return;
                if (!message.data) return;
                if (message.data.status !== 0) return;
                setShowWebView(false);
                setLoginStep("Obtention des informations");
                setLoggingIn(true);

                if (currentLoginStateIntervalRef.current)
                  clearInterval(currentLoginStateIntervalRef.current);

                const session = pronote.createSessionHandle();
                const refresh = await pronote
                  .loginToken(session, {
                    url: instanceURL,
                    kind: pronote.AccountKind.STUDENT,
                    username: message.data.login,
                    token: message.data.mdp,
                    deviceUUID
                  }
                  ).catch((error) => {
                    if (error instanceof pronote.SecurityError && !error.handle.shouldCustomPassword && !error.handle.shouldCustomDoubleAuth) {
                      navigation.navigate("Pronote2FA_Auth", {
                        session,
                        error,
                        accountID: deviceUUID
                      });
                    } else {
                      throw error;
                    }
                  });

                if (!refresh) throw pronote.AuthenticateError;

                const user = session.user.resources[0];
                const name = user.name;

                const account: Account = {
                  instance: session,

                  localID: deviceUUID,
                  service: AccountService.Pronote,

                  isExternal: false,
                  linkedExternalLocalIDs: [],

                  name,
                  className: user.className,
                  schoolName: user.establishmentName,
                  studentName: {
                    first: extract_pronote_name(name).givenName,
                    last: extract_pronote_name(name).familyName,
                  },

                  authentication: { ...refresh, deviceUUID },
                  personalization: await defaultPersonalization(session),

                  identity: {},
                  serviceData: {},
                  providers: []
                };

                pronote.startPresenceInterval(session);
                createStoredAccount(account);
                setLoading(false);
                switchTo(account);

                // We need to wait a tick to make sure the account is set before navigating.
                queueMicrotask(() => {
                  // Reset the navigation stack to the "Home" screen.
                  // Prevents the user from going back to the login screen.
                  playSound(LEson4);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "AccountCreated" }],
                  });
                });
              }
            }}
            onLoadEnd={(e) => {
              const { url } = e.nativeEvent;

              webViewRef.current?.injectJavaScript(
                INJECT_PRONOTE_INITIAL_LOGIN_HOOK
              );

              if (
                url.includes(
                  "InfoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4"
                )
              ) {
                webViewRef.current?.injectJavaScript(INJECT_PRONOTE_JSON);
              } else {
                setLoading(false);
                if (url.includes("pronote/mobile.eleve.html")) {
                  if (!url.includes("identifiant")) {
                    showAlert({
                      title: "Attention",
                      message: "Désolé, seuls les comptes élèves sont compatibles pour le moment.",
                      icon: <BadgeInfo />,
                      actions: [
                        {
                          title: "OK",
                          primary: true,
                          icon: <Undo2 />,
                          onPress: () => navigation.goBack(),
                        },
                      ],
                    });
                  } else {
                    webViewRef.current?.injectJavaScript(
                      INJECT_PRONOTE_INITIAL_LOGIN_HOOK
                    );
                    webViewRef.current?.injectJavaScript(
                      INJECT_PRONOTE_CURRENT_LOGIN_STATE
                    );
                  }
                }

                if (url.split("?")[0].includes("mobile.eleve.html") == false) {
                  setShowWebView(true);
                }
              }
            }}
            incognito={true} // prevent to keep cookies on webview load
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

export default PronoteWebview;
