import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/ui/components/Button";
import Typography from "@/ui/components/Typography";

// react-native-webview has no web build (it calls
// TurboModuleRegistry.getEnforcing at import time, which crashes on web),
// and this screen's OAuth flow relies on intercepting the webview's
// navigation to read a "code" query param from the redirect — that needs a
// real popup/redirect-handling redesign to work safely on web, not just a
// stub. Rather than risk mishandling an OAuth callback, this connection
// method is disabled on desktop for now.
export default function AppschoWebViewWeb() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
        <Typography variant="h4" align="center">
          {t("ONBOARDING_APPSCHO_UNAVAILABLE_WEB_TITLE", "Indisponible sur PC pour l'instant")}
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center">
          {t(
            "ONBOARDING_APPSCHO_UNAVAILABLE_WEB_DESCRIPTION",
            "La connexion à ce service nécessite pour l'instant l'application mobile."
          )}
        </Typography>
        <Button title={t("ONBOARDING_GO_BACK", "Retour")} onPress={() => router.back()} style={{ marginTop: 8 }} />
      </View>
    </SafeAreaView>
  );
}
