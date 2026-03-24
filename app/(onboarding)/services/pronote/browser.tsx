import { useRoute, useTheme } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
import { AccountKind, createSessionHandle, loginToken, SecurityError, SessionHandle } from "pawnote";
import React, { createRef, RefObject, useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal } from "react-native";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";
import WebView from "react-native-webview";
import { WebViewMessage } from "react-native-webview/lib/WebViewTypes";

import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import ActivityIndicator from "@/ui/components/ActivityIndicator";
import Stack from "@/ui/components/Stack";
import Divider from "@/ui/new/Divider";
import Typography from "@/ui/new/Typography";
import { URLToBase64 } from "@/utils/attachments/helper";
import { customFetcher } from "@/utils/pronote/fetcher";
import { GetIdentityFromPronoteUsername } from "@/utils/pronote/name";
import uuid from "@/utils/uuid/uuid";

import OnboardingWebView from "../../components/OnboardingWebView";
import { Pronote2FAModal } from "./2fa";

export default function PronoteENTLogin() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { params } = useRoute();
  const { url, school } = params;
  const baseURL = url.split("/pronote")[0];

  // UI Logic
  const [browserVisible, setBrowserVisible] = React.useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  const webViewRef: RefObject<WebView<{}> | null> = createRef<WebView>();

  // Login logic
  const infoMobileURL = url + "/InfoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4";

  const [deviceUUID] = useState(uuid());
  const [received, setReceived] = useState<boolean>(false);
  console.log("WebViewScreen initialized with URL:", url);

  const [challengeModalVisible, setChallengeModalVisible] = useState<boolean>(false);
  const [doubleAuthError, setDoubleAuthError] = useState<SecurityError | null>(null);
  const [doubleAuthSession, setDoubleAuthSession] = useState<SessionHandle | null>(null);
  const [deviceId, setDeviceId] = useState<string>("");

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

          console.log(lJetonCas)

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
    console.log("Message received from WebView:", message);

    if (message.type === "pronote.loginState") {
      console.log("Login state message received:", message.data);

      if (!message.data) {
        console.warn("No login data in message");
        return;
      }
      if (message.data.status !== 0) {
        console.warn("Login status is not valid:", message.data.status);
        return;
      }
      setReceived(true);

      console.log(message.data.login, message.data.mdp);
      console.log("Creating session handle...");
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

        console.log("Login successful, adding account to store...");
        const schoolName = session.user.resources[0].establishmentName;
        const className = session.user.resources[0].className;
        const { firstName, lastName } = GetIdentityFromPronoteUsername(session.user.name)

        let pp = "";
        if (session.user.resources[0].profilePicture?.url) {
          pp = await URLToBase64(session.user.resources[0].profilePicture?.url)
        }

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

        const parent = navigation.getParent();
        if (parent) {
          parent.goBack();
          
          const parentsParent = parent.getParent();
          if (parentsParent) {
            parentsParent.goBack();
          }
        }

        router.back();
        router.dismissAll();
        return router.push("/");
      } catch (error) {
        if (error instanceof SecurityError && !error.handle.shouldCustomPassword && !error.handle.shouldCustomDoubleAuth) {
          setDoubleAuthError(error)
          setDoubleAuthSession(session)
          setDeviceId(deviceUUID)
          setChallengeModalVisible(true)
        } else {
          console.error("Error during login:", error);
          throw error;
        }
      }
    }
  };

  const onWebviewLoadEnd = (e: WebViewNavigationEvent | WebViewErrorEvent) => {
    const { url } = e.nativeEvent;
    console.log("WebView finished loading URL:", url);

    if(url.includes("/pronote/mobile.eleve.html")) {
      setBrowserVisible(false);
    } else if (url === infoMobileURL) {
      setBrowserVisible(false);
    } else {
      setBrowserVisible(true);
    }

    webViewRef.current?.injectJavaScript(
      INJECT_PRONOTE_INITIAL_LOGIN_HOOK,
    );

    if (url === infoMobileURL) {
      console.log("Injecting JSON script for InfoMobileURL");
      webViewRef.current?.injectJavaScript(INJECT_PRONOTE_JSON);
    } else if (url.includes("mobile.eleve.html")) {
      console.log("Injecting login state scripts for student account");
      webViewRef.current?.injectJavaScript(
        INJECT_PRONOTE_INITIAL_LOGIN_HOOK,
      );
      webViewRef.current?.injectJavaScript(
        INJECT_PRONOTE_CURRENT_LOGIN_STATE,
      );
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={20}>
      {!browserVisible &&
        <Reanimated.View
          style={{
            height: "100%",
            width: "100%",
            position: "absolute",
            backgroundColor: colors.card,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          entering={FadeIn.duration(130)}
          exiting={FadeOut.duration(130)}
        >
          <Stack vAlign="center" hAlign="center" width={"100%"} gap={3} padding={20}>
            <ActivityIndicator />
            <Divider height={12} ghost />
            <Typography align="center" variant="h4">Connexion à {school && school.name ? school.name : "votre établissement"}</Typography>
            <Typography align="center" variant="body" color="textSecondary">Cela peut prendre quelques secondes.</Typography>
          </Stack>
        </Reanimated.View>
      }

      <OnboardingWebView
        source={{ uri: infoMobileURL }}
        webViewRef={webViewRef}
        incognito={true}
        userAgent="Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
        onMessage={onWebviewMessage}
        onLoadEnd={onWebviewLoadEnd}
        startInLoadingState
        onOpenWindow={(evt) => {
          webViewRef.current?.stopLoading();
          webViewRef.current?.injectJavaScript(`window.location.assign("${evt.nativeEvent.targetUrl}");`); // Yes, this is tricky, but it's in official documentation
        }}
        injectedJavaScript={`
        var meta = document.createElement('meta');
        meta.setAttribute('name', 'viewport');
        meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        document.getElementsByTagName('head')[0].appendChild(meta);
        `}
      />

      <Modal
        visible={challengeModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChallengeModalVisible(false)}
      >
        <Pronote2FAModal doubleAuthSession={doubleAuthSession} doubleAuthError={doubleAuthError} setChallengeModalVisible={setChallengeModalVisible} deviceId={deviceId} />
      </Modal>
    </KeyboardAvoidingView>
  )
}