import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/ui/components/Button";
import Typography from "@/ui/components/Typography";

// react-native-webview has no web build (it calls
// TurboModuleRegistry.getEnforcing at import time, which crashes on web).
// This screen also negotiates a real PRONOTE session (createSessionHandle,
// finishLoginManually, securitySave…) by watching the embedded browser's
// navigation — that needs a proper popup/redirect-handling redesign to work
// safely on web, not just a stub, so this connection method (ENT/SSO login)
// is disabled on desktop for now. Direct PRONOTE address/credentials login
// (services/pronote/url.tsx) is unaffected.
export default function PronoteENTLoginWeb() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
        <Typography variant="h4" align="center">
          {t("ONBOARDING_PRONOTE_ENT_UNAVAILABLE_WEB_TITLE", "Indisponible sur PC pour l'instant")}
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center">
          {t(
            "ONBOARDING_PRONOTE_ENT_UNAVAILABLE_WEB_DESCRIPTION",
            "La connexion via l'ENT de ton établissement nécessite pour l'instant l'application mobile. Si ton établissement accepte une connexion directe à PRONOTE, utilise plutôt cette méthode."
          )}
        </Typography>
        <Button title={t("ONBOARDING_GO_BACK", "Retour")} onPress={() => router.back()} style={{ marginTop: 8 }} />
      </View>
    </SafeAreaView>
  );
}
