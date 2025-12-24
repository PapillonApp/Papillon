import { router, useGlobalSearchParams } from "expo-router";
import { AccountKind, createSessionHandle, loginToken, SecurityError, SessionHandle } from "pawnote";
import React, { createRef, RefObject, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { WebViewErrorEvent, WebViewMessage, WebViewNavigationEvent } from "react-native-webview/lib/WebViewTypes";

import OnboardingWebview from "@/components/onboarding/OnboardingWebview";
import { initializeAccountManager } from "@/services/shared";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Typography from "@/ui/components/Typography";
import { URLToBase64 } from "@/utils/attachments/helper";
import { customFetcher } from "@/utils/pronote/fetcher";
import { GetIdentityFromPronoteUsername } from "@/utils/pronote/name";
import uuid from "@/utils/uuid/uuid";

import { Pronote2FAModal } from "./2fa";

export default function WebViewScreen() {
  const { url, serviceId } = useGlobalSearchParams<{ url: string, serviceId?: string }>();
  const infoMobileURL = url + "/InfoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4";

  const { t } = useTranslation();
  const [deviceUUID] = useState(uuid());
  const [received, setReceived] = useState<boolean>(false);

  const [challengeModalVisible, setChallengeModalVisible] = useState<boolean>(false);
  const [doubleAuthError, setDoubleAuthError] = useState<SecurityError | null>(null);
  const [doubleAuthSession, setDoubleAuthSession] = useState<SessionHandle | null>(null);
  const [deviceId, setDeviceId] = useState<string>("");

  if (!url) {
    return (
      <View style={styles.container}>
        <Typography>Aucune URL fournie</Typography>
      </View>
    );
  }

  const webViewRef: RefObject<WebView<object> | null> = createRef<WebView>();
  const PRONOTE_COOKIE_EXPIRED = new Date(0).toUTCString();
  const PRONOTE_COOKIE_VALIDATION_EXPIRES = new Date(
    new Date().getTime() + 5 * 60 * 1000,
  ).toUTCString();
  const PRONOTE_COOKIE_LANGUAGE_EXPIRES = new Date(
    new Date().getTime() + 365 * 24 * 60 * 60 * 1000,
  ).toUTCString();

  const INJECT_PRONOTE_INITIAL_LOGIN_HOOK = `
    window.hookAccesDepuisAppli = function() {
      this.passerEnModeValidationAppliMobile('', '${deviceUUID}');
    };

    try {
          window.GInterface.passerEnModeValidationAppliMobile('', '${deviceUUID}', '', '', '{"model": "random", "platform": "android"}');
    } catch {}
    `.trim();

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

          window.location.assign("${url}/mobile.eleve.html?fd=1");
        }
        catch (error) {
          console.error("Error parsing JSON or injecting cookies:", error);
        }
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

  const onWebviewMessage = async ({ nativeEvent }: { nativeEvent: WebViewMessage }) => {
    if (received) { return; }

    const message = JSON.parse(nativeEvent.data);

    if (message.type === "pronote.loginState") {
      if (!message.data) {
        return;
      }
      if (message.data.status !== 0) {
        return;
      }
      setReceived(true);

      const session = createSessionHandle(customFetcher);
      try {
        const refresh = await loginToken(
          session,
          {
            url: url,
            kind: AccountKind.STUDENT,
            username: message.data.login,
            token: message.data.mdp,
            deviceUUID,
          },
        );

        if (!refresh) {
          throw new Error("Erreur lors de la connexion");
        }

        const schoolName = session.user.resources[0].establishmentName;
        const className = session.user.resources[0].className;
        const { firstName, lastName } = GetIdentityFromPronoteUsername(session.user.name)

        let pp = "";
        if (session.user.resources[0].profilePicture?.url) {
          pp = await URLToBase64(session.user.resources[0].profilePicture?.url)
        }
        if (!serviceId) {
          useAccountStore.getState().addAccount({
            id: deviceUUID,
            firstName,
            lastName,
            schoolName,
            className,
            customisation: {
              profilePicture: pp,
              subjects: {}
            },
            services: [{
              id: deviceUUID,
              auth: {
                accessToken: refresh.token,
                refreshToken: refresh.token,
                additionals: {
                  instanceURL: refresh.url,
                  kind: refresh.kind,
                  username: refresh.username,
                  deviceUUID,
                },
              },
              serviceId: Services.PRONOTE,
              createdAt: (new Date()).toISOString(),
              updatedAt: (new Date()).toISOString(),
            }],
            createdAt: (new Date()).toISOString(),
            updatedAt: (new Date()).toISOString(),
          });

          useAccountStore.getState().setLastUsedAccount(deviceUUID);
          return router.push({
            pathname: "../end/color",
            params: {
              accountId: deviceUUID,
            },
          });
        }

        useAccountStore.getState().updateServiceAuthData(serviceId, {
          accessToken: refresh.token,
          refreshToken: refresh.token,
          additionals: {
            instanceURL: refresh.url,
            kind: refresh.kind,
            username: refresh.username,
            deviceUUID,
          },
        })
        await initializeAccountManager()
        return router.push("../../(tabs)")
      } catch (error) {
        if (error instanceof SecurityError && !error.handle.shouldCustomPassword && !error.handle.shouldCustomDoubleAuth) {
          setDoubleAuthError(error)
          setDoubleAuthSession(session)
          setDeviceId(deviceUUID)
          setChallengeModalVisible(true)
        } else {
          throw error;
        }
      }
    }
  };

  const onWebviewLoadEnd = (e: WebViewNavigationEvent | WebViewErrorEvent) => {
    const { url } = e.nativeEvent;

    webViewRef.current?.injectJavaScript(
      INJECT_PRONOTE_INITIAL_LOGIN_HOOK,
    );

    if (url === infoMobileURL) {
      webViewRef.current?.injectJavaScript(INJECT_PRONOTE_JSON);
    } else if (url.includes("mobile.eleve.html")) {
      webViewRef.current?.injectJavaScript(
        INJECT_PRONOTE_INITIAL_LOGIN_HOOK,
      );
      webViewRef.current?.injectJavaScript(
        INJECT_PRONOTE_CURRENT_LOGIN_STATE,
      );
    }
  };

  return (
    <>
      <OnboardingWebview
        title={t("ONBOARDING_WEBVIEW_TITLE")}
        color={"#E50052"}
        step={3}
        totalSteps={3}
        webviewProps={{
          source: { uri: infoMobileURL },
          incognito: true,
          userAgent: "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
          onMessage: onWebviewMessage,
          onLoadEnd: onWebviewLoadEnd,
          onOpenWindow: (evt => {
            webViewRef.current?.stopLoading();
            webViewRef.current?.injectJavaScript(`window.location.assign("${evt.nativeEvent.targetUrl}");`); // Yes, this is tricky, but it's in official documentation
          }),
          injectedJavaScript: `
        var meta = document.createElement('meta');
        meta.setAttribute('name', 'viewport');
        meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        document.getElementsByTagName('head')[0].appendChild(meta);
        `
        }}
        webViewRef={webViewRef}
      />
      <Modal
        visible={challengeModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChallengeModalVisible(false)}
      >
        <Pronote2FAModal doubleAuthSession={doubleAuthSession} doubleAuthError={doubleAuthError} setChallengeModalVisible={setChallengeModalVisible} deviceId={deviceId} />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  webview: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 200,
    backgroundColor: "#ffffff42",
    padding: 10,
    borderRadius: 100,
  },
});
