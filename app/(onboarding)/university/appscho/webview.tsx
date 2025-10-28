import OnboardingWebview from "@/components/onboarding/OnboardingWebview";
import { router, useLocalSearchParams } from "expo-router";
import { INSTANCES, getCASURL, loginWithOAuth } from "appscho";
import { useTranslation } from "react-i18next";
import { useAlert } from "@/ui/components/AlertProvider";
import { useAccountStore } from "@/stores/account";
import { ServiceAccount, Services } from "@/stores/account/types";
import uuid from "@/utils/uuid/uuid";
import { useState } from "react";

export default function AppschoWebView() {
  const { instanceId } = useLocalSearchParams<{ instanceId: string }>();
  const { t } = useTranslation();
  const alert = useAlert();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const instance = INSTANCES.find(inst => inst.id === instanceId);
  const loginURL = getCASURL(instance?.id as string);

  const handleRequest = async (url: string) => {
    
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    
    if (code && !isProcessing && instance) {
      setIsProcessing(true);
      
      try {
        const response = await loginWithOAuth(instance.id, code);

        const id = uuid();
        const service: ServiceAccount = {
          id,
          auth: {
            additionals: {
              instanceId: instance.id,
              code: code,
              refreshToken: response.refreshToken || "",
            },
          },
          serviceId: Services.APPSCHO,
          createdAt: (new Date()).toISOString(),
          updatedAt: (new Date()).toISOString(),
        };

        const store = useAccountStore.getState();

        store.addAccount({
          id,
          firstName: response.firstname || "User",
          lastName: response.lastname || instance.name,
          schoolName: response.program || instance.name,
          className: response.department ?? undefined,
          services: [service],
          createdAt: (new Date()).toISOString(),
          updatedAt: (new Date()).toISOString(),
        });
        
        store.setLastUsedAccount(id);

        return router.push({
          pathname: "/(onboarding)/end/color",
          params: {
            accountId: id,
          },
        });
      } catch (error) {
        Error(`OAuth login error: ${error}`);
        alert.showAlert({
          title: "Erreur d'authentification",
          description: "Une erreur est survenue lors de la connexion OAuth.",
          icon: "TriangleAlert",
          color: "#D60046",
          technical: String(error),
          withoutNavbar: true,
        });
        setIsProcessing(false);
      }
    }
  };

  return (
    <OnboardingWebview
      title={t("ONBOARDING_WEBVIEW_TITLE")}
      color={"#1E3035"}
      step={2}
      totalSteps={3}
      webviewProps={{
        source: loginURL
          ? { uri: loginURL }
          : { html: "<h1>Chargement...</h1>" },
        onShouldStartLoadWithRequest: (request) => {
          handleRequest(request.url);
          return true;
        }
      }}
    />
  );
}
