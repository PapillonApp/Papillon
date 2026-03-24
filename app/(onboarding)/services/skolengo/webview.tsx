import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView } from "react-native";
import { AuthFlow, ChallengeMethod, School } from "skolengojs";

import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import { log } from "@/utils/logger/logger";
import uuid from "@/utils/uuid/uuid";

import OnboardingWebView from "../../components/OnboardingWebView";

export default function WebViewScreen() {
  const navigation = useNavigation();
  const [loginURL, setLoginURL] = useState<string | undefined>(undefined);
  const [flow, setFlow] = useState<AuthFlow>();
  const { ref } = useLocalSearchParams();
  const parsedRef = typeof ref === "string" ? JSON.parse(ref) : {};
  const school = new School(parsedRef.id, parsedRef.name, parsedRef.emsCode, parsedRef.OIDCWellKnown, parsedRef.location, parsedRef.homepage);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      const scheme = url.split(":")[0];
      if (scheme === "skoapp-prod") {
        log("[Skolengo] Activation link received:", url);
        handleRequest(url);
      } else {
        log("[Skolengo] Ignoring link:", url);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    Linking.addEventListener("url", handleDeepLink);
  }, []);

  const flowRef = useRef<AuthFlow | null>(null);

  const initLogin = useCallback(async () => {
    const flow = await school.initializeLogin(ChallengeMethod.PLAIN);
    flowRef.current = flow;
    setFlow(flow);
    setLoginURL(flow.loginURL);
  }, []);

  useEffect(() => {
    initLogin();
  }, [initLogin]);

  const handleRequest = async (url: string) => {
    if (url.startsWith("skoapp-prod://")) {
      const code = url.match(/code=([^&]*)/)
      const state = url.match(/state=([^&]*)/)

      if (!code || !state) { return false; }
      if (!flowRef.current) {
        return false;
      }
      const auth = await flowRef.current.finalizeLogin(code[1], state[1])
      const store = useAccountStore.getState();
      const id = uuid()

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

      store.addAccount(account)
      store.setLastUsedAccount(id)

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
    }
    return true;
  };

  const { t } = useTranslation();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={20}>
      <OnboardingWebView
        source={loginURL ? { uri: loginURL } : { html: "<h1>Chargement...</h1>" }}
        onShouldStartLoadWithRequest={(request) => {
          handleRequest(request.url)
          return true;
        }}
      />
    </KeyboardAvoidingView>
  );
}