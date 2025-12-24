import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthFlow, ChallengeMethod, School } from "skolengojs";

import OnboardingWebview from "@/components/onboarding/OnboardingWebview";
import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import { log } from "@/utils/logger/logger";
import uuid from "@/utils/uuid/uuid";

export default function WebViewScreen() {
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

      router.push({
        pathname: "../end/color",
        params: {
          accountId: id
        }
      });

      return false;
    }
    return true;
  };

  const { t } = useTranslation();

  return (
    <OnboardingWebview
      title={t("ONBOARDING_WEBVIEW_TITLE")}
      color={"#E50052"}
      step={3}
      totalSteps={3}
      webviewProps={{
        source: loginURL
          ? { uri: loginURL }
          : { html: "<h1>Chargement...</h1>" },
        onShouldStartLoadWithRequest: (request) => {
          handleRequest(request.url)
          return true;
        }
      }}
    />
  );
}