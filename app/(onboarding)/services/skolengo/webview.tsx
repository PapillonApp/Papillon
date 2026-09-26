import * as Linking from "expo-linking";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, KeyboardAvoidingView } from "react-native";
import { AuthFlow, ChallengeMethod, School } from "skolengojs";

import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import { error, log } from "@/utils/logger/logger";
import uuid from "@/utils/uuid/uuid";

import OnboardingWebView from "../../components/OnboardingWebView";

export default function WebViewScreen() {
  const navigation = useNavigation();
  const [loginURL, setLoginURL] = useState<string | undefined>(undefined);
  const { ref } = useLocalSearchParams();
  const parsedRef = typeof ref === "string" ? JSON.parse(ref) : {};
  const school = new School(parsedRef.id, parsedRef.name, parsedRef.emsCode, parsedRef.OIDCWellKnown, parsedRef.location, parsedRef.homepage);

  const flowRef = useRef<AuthFlow | null>(null);
  const consumedCodeRef = useRef<string | null>(null);
  const { t } = useTranslation();

  const initLogin = useCallback(async () => {
    const flow = await school.initializeLogin(ChallengeMethod.S256);
    flowRef.current = flow;
    setLoginURL(flow.loginURL);
  }, []);

  useEffect(() => {
    initLogin();
  }, [initLogin]);

  const handleRequest = useCallback(async (url: string) => {
    if (!url.startsWith("skoapp-prod://")) { return true; }

    const code = url.match(/code=([^&]*)/)?.[1];
    const state = url.match(/state=([^&]*)/)?.[1];
    if (!code || !state || !flowRef.current) { return false; }

    if (consumedCodeRef.current === code) { return false; }
    consumedCodeRef.current = code;

    try {
      const auth = await flowRef.current.finalizeLogin(code, state);
      const store = useAccountStore.getState();
      const id = uuid();

      const account: Account = {
        id,
        firstName: auth?.firstName ?? "",
        lastName: auth?.lastName ?? "",
        schoolName: auth?.school.name,
        className: auth?.className,
        services: [
          {
            id: id,
            auth: {
              accessToken: auth.refreshToken,
              refreshToken: auth.refreshToken,
              additionals: {
                refreshUrl: auth.refreshURL,
                wellKnown: flowRef.current.endpoints.wellKnown,
                tokenEndpoint: flowRef.current.endpoints.tokenEndpoint,
                emsCode: flowRef.current.school.emsCode
              }
            },
            serviceId: Services.SKOLENGO,
            createdAt: (new Date()).toISOString(),
            updatedAt: (new Date()).toISOString()
          }
        ],
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString()
      }

      store.addAccount(account);
      store.setLastUsedAccount(id);

      const parent = navigation.getParent();
      if (parent) {
        parent.goBack();
        parent.getParent()?.goBack();
      }
      router.back();
      router.dismissAll();
      router.push("/");
    } catch (err) {
      consumedCodeRef.current = null;
      error("[Skolengo] Failed to finalize login: " + String(err));
      Alert.alert(t("Alert_Auth_Error"), t("ONBOARDING_ALERT_LOGIN_ABORTED"));
    }
    return false;
  }, [navigation, t]);

  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      if (url.split(":")[0] === "skoapp-prod") {
        log("[Skolengo] Activation link received:", url);
        handleRequest(url);
      }
    };

    const listener = Linking.addEventListener("url", handleDeepLink);
    return () => listener.remove();
  }, [handleRequest]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={20}>
      <OnboardingWebView
        source={loginURL ? { uri: loginURL } : { html: `<h1>${t("ONBOARDING_LOADING")}</h1>` }}
        onShouldStartLoadWithRequest={(request) => {
          if (request.url.startsWith("skoapp-prod://")) {
            handleRequest(request.url);
            return false;
          }
          return true;
        }}
      />
    </KeyboardAvoidingView>
  );
}
