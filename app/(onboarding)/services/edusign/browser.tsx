import { useTheme } from "expo-router/react-navigation";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useRef } from "react";
import { Alert, Linking, View } from "react-native";
import { useTranslation } from "react-i18next";
import WebView from "react-native-webview";
import { WebViewNavigationEvent, WebViewErrorEvent } from "react-native-webview/lib/WebViewTypes";

import {
  loginWithCasSso,
  loginWithMicrosoft,
  loginWithMicrosoftSso,
  loginWithOauthSso,
  exchangeSamlAuthCode,
  SsoConfig,
  EDUSIGN_MICROSOFT_OAUTH_URL,
} from "@studentsphere/linksign";

import { getStaticDeviceId } from "@/utils/device";
import uuid from "@/utils/uuid/uuid";
import OnboardingWebView from "../../components/OnboardingWebView";
import { useAlert } from "@/ui/components/AlertProvider";
import { completeEdusignLogin } from "./utils";

const ANDROID_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36";

const SPOOF_ANDROID_NAVIGATOR = `
  (function() {
    var overrides = { platform: 'Linux armv8l', vendor: 'Google Inc.' };
    Object.keys(overrides).forEach(function(key) {
      try {
        Object.defineProperty(Navigator.prototype, key, {
          get: function() { return overrides[key]; },
          configurable: true,
        });
      } catch (e) {}
    });
  })();
  true;
`;

export default function EdusignBrowser() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const alert = useAlert();
  const { ssoUrl, ssoConfig: ssoConfigStr, mode = "sso", isWhitelabelApp } = useLocalSearchParams<{
    ssoUrl?: string;
    ssoConfig?: string;
    mode?: string;
    isWhitelabelApp?: string;
  }>();
  const isWhitelabel = isWhitelabelApp === "true";

  const webViewRef = useRef<WebView>(null);
  const isHandlingRedirectRef = useRef(false);

  let ssoConfig: SsoConfig | null = null;
  if (mode === "sso" && ssoConfigStr) {
    try {
      ssoConfig = JSON.parse(ssoConfigStr);
    } catch (e) {
      console.error("Invalid ssoConfig string", e);
    }
  }

  const targetUrl = mode === "microsoft" ? EDUSIGN_MICROSOFT_OAUTH_URL : ssoUrl;

  const handleRedirect = async (url: string) => {
    if (!url || isHandlingRedirectRef.current) return;

    if (url.startsWith("https://edusign.app/student")) {
      const queryIndex = url.indexOf("?");
      if (queryIndex !== -1) {
        const queryParams = new URLSearchParams(url.substring(queryIndex));
        const code = queryParams.get("code") || queryParams.get("auth_code");
        const ticket = queryParams.get("ticket");

        if (code || ticket) {
          isHandlingRedirectRef.current = true;
          console.log("[EdusignBrowser] Intercepted redirect with code/ticket:", { mode, hasCode: !!code, hasTicket: !!ticket });

          try {
            const device = uuid();
            let authSession: any;

            const staticDeviceId = await getStaticDeviceId();

            if (mode === "microsoft" && code) {
              authSession = await loginWithMicrosoft(code, isWhitelabel, staticDeviceId);
            } else if (mode === "sso" && ssoConfig) {
              if (ssoConfig.type === "microsoft" && code) {
                authSession = await loginWithMicrosoftSso(code, isWhitelabel, staticDeviceId);
              } else if (ssoConfig.type === "cas" && ticket) {
                authSession = await loginWithCasSso(ticket, ssoConfig.SCHOOL_ID, isWhitelabel, staticDeviceId);
              } else if (ssoConfig.type === "oauth" && code) {
                authSession = await loginWithOauthSso(code, ssoConfig.SCHOOL_ID, staticDeviceId);
              } else if (ssoConfig.type === "saml" && code) {
                authSession = await exchangeSamlAuthCode(code, staticDeviceId);
              } else {
                throw new Error("Unsupported SSO type");
              }
            } else {
              throw new Error("Invalid parameters");
            }

            console.log("[EdusignBrowser] Auth session result:", {
              email: authSession?.EMAIL,
              hasMultiAccounts: authSession?.HAS_MULTI_ACCOUNTS,
              numberOfAccounts: authSession?.NUMBER_OF_ACCOUNTS,
            });

            if (
              (authSession.HAS_MULTI_ACCOUNTS || authSession.NUMBER_OF_ACCOUNTS > 1) &&
              authSession.EMAIL
            ) {
              Alert.alert(
                t("Alert_Pin_Verification_Title"),
                t("Alert_Pin_Verification_Description")
              );
              // Redirect to PIN verification step
              router.replace({
                pathname: "./authenticate",
                params: {
                  identifier: authSession.EMAIL,
                  initialNeedsPin: "true",
                  fromSso: "true",
                },
              });
              return;
            }

            const tokenToUse = authSession.TOKEN || authSession.ACCESS_TOKEN;
            if (!tokenToUse) {
              throw new Error("Invalid credentials");
            }
            const refreshToUse = authSession.REFRESH_TOKEN;

            await completeEdusignLogin({
              token: tokenToUse,
              refreshToken: refreshToUse,
              localDeviceId: device,
              selectedSchoolName: authSession.SCHOOL?.NAME,
              authSession,
              navigation,
            });
          } catch (e: any) {
            isHandlingRedirectRef.current = false;
            console.error("[EdusignBrowser] Error during login redirect:", e);

            let description = t("Alert_Login_Failed");
            if (
              e.name === "StudentAccountSsoNotFoundError" ||
              e.message?.includes("Student account SSO configuration not found") ||
              e.message?.includes("ERR_STUDENT_ACCOUNT_SSO_NOT_FOUND")
            ) {
              description = t("Alert_No_Student_Account");
            } else if (e.message === "Unsupported SSO type") {
              description = t("Alert_Unsupported_SSO");
            } else if (e.message === "Invalid parameters") {
              description = t("Alert_Invalid_Parameters");
            } else if (e.message === "Invalid credentials") {
              description = t("Alert_Bad_Credentials");
            } else if (e.message === "Failed to retrieve profile") {
              description = t("Alert_Profile_Error");
            }

            alert.showAlert({
              title: t("Alert_Connexion_Fail"),
              description,
              icon: "AlertTriangle",
              color: "#D60046",
              withoutNavbar: true,
            });
            if (router.canGoBack()) router.back();
          }
        }
      } else if (mode === "sso" && ssoConfig?.type === "saml") {
        webViewRef.current?.injectJavaScript(`
          (function() {
            var token = localStorage.getItem('token') || localStorage.getItem('ACCESS_TOKEN');
            var refresh = localStorage.getItem('refreshToken') || localStorage.getItem('REFRESH_TOKEN');
            if (token) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'saml_success', token: token, refresh: refresh }));
            }
          })();
        `);
      }
    }
  };

  const onWebviewLoadEnd = (e: WebViewNavigationEvent | WebViewErrorEvent) => {
    handleRedirect(e.nativeEvent.url);
  };

  const onWebviewMessage = async ({ nativeEvent }: any) => {
    let message: any;
    try {
      message = JSON.parse(nativeEvent.data);
    } catch {
      return;
    }

    if (message.type === "saml_success" && message.token) {
      try {
        const localDeviceId = uuid();

        await completeEdusignLogin({
          token: message.token,
          refreshToken: message.refresh || "",
          localDeviceId,
          authSession: message.profile,
          navigation,
        });
      } catch (e: any) {
        console.error("[EdusignBrowser] SAML error:", e);
        alert.showAlert({
          title: t("Alert_SAML_Error_Title"),
          description: t("Alert_Profile_Error"),
          icon: "AlertTriangle",
          color: "#D60046",
          withoutNavbar: true,
        });
        if (router.canGoBack()) router.back();
      }
    }
  };

  if (!targetUrl) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <OnboardingWebView
        source={{ uri: targetUrl }}
        webViewRef={webViewRef}
        incognito={true}
        userAgent={ANDROID_USER_AGENT}
        injectedJavaScriptBeforeContentLoaded={SPOOF_ANDROID_NAVIGATOR}
        injectedJavaScriptBeforeContentLoadedForMainFrameOnly={false}
        onShouldStartLoadWithRequest={(request) => {
          const { url } = request;
          if (url.startsWith("https://edusign.app/student")) {
            handleRedirect(url);
            return false;
          }
          if (
            url.startsWith("msauth://") ||
            url.startsWith("intent://") ||
            (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("about:blank"))
          ) {
            Linking.canOpenURL(url).then((supported) => {
              if (supported) Linking.openURL(url);
            });
            return false;
          }
          return true;
        }}
        onNavigationStateChange={(navState) => {
          handleRedirect(navState.url);
        }}
        onLoadEnd={onWebviewLoadEnd}
        onMessage={onWebviewMessage}
        startInLoadingState
      />
    </View>
  );
}
