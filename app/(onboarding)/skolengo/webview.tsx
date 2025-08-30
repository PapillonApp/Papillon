import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import uuid from "@/utils/uuid/uuid";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AuthFlow, School } from "skolengojs";
import OnboardingWebview from "@/components/onboarding/OnboardingWebview";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { useTranslation } from "react-i18next";

export default function WebViewScreen() {
  const [loginURL, setLoginURL] = useState<string | undefined>(undefined);
  const [flow, setFlow] = useState<AuthFlow>();
  const { ref } = useLocalSearchParams();
  const parsedRef = typeof ref === "string" ? JSON.parse(ref) : {};
  const school = new School(parsedRef.id, parsedRef.name, parsedRef.emsCode, parsedRef.OIDCWellKnown, parsedRef.location, parsedRef.homepage);

  const initLogin = useCallback(async () => {
    const flow = await school.initializeLogin()
    setFlow(flow)
    return setLoginURL(flow.loginURL)
  }, []);

  useEffect(() => {
    initLogin();
  }, [initLogin]);

  const handleRequest = async (request: { url: string }) => {
    const url = request.url;

    console.log(url)

    if (url.startsWith("skoapp-prod://")) {
      const code = url.match(/code=([^&]*)/)
      const state = url.match(/state=([^&]*)/)

      if (!code || !state) return false;

      const auth = await flow?.finalizeLogin(code[1], state[1])
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
              session: auth
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
        source: loginURL ? { uri: loginURL } : { html: "<h1>Chargement...</h1>" },
        onShouldStartLoadWithRequest: (request: ShouldStartLoadRequest) => {
          handleRequest(request).then((result) => {
            return result;
          });
          return false;
        }
      }}
    />
  );
}