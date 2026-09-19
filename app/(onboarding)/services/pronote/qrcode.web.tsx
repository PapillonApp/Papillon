import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "expo-router/react-navigation";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/ui/components/Button";
import Icon from "@/ui/components/Icon";
import Typography from "@/ui/components/Typography";

// Scanning a PRONOTE QR code needs a phone camera pointed at a screen —
// there is no equivalent flow on desktop, so this build intentionally
// disables it here (see app/(onboarding)/utils/constants.tsx and
// services/pronote/locate.tsx, where the QR entry points are hidden on web).
// This screen only exists as a safety net for anyone who still lands on the
// route directly.
export default function PronoteLoginWithQRWeb() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
        <Icon size={48}>
          <Papicons name="QrCode" />
        </Icon>
        <Typography variant="h4" align="center">
          {t("ONBOARDING_PRONOTE_QRCODE_UNAVAILABLE_WEB_TITLE", "Indisponible sur PC")}
        </Typography>
        <Typography variant="body" color="textSecondary" align="center">
          {t(
            "ONBOARDING_PRONOTE_QRCODE_UNAVAILABLE_WEB_DESCRIPTION",
            "La connexion par QR code nécessite l'appareil photo d'un téléphone. Utilise plutôt l'adresse de ton établissement pour te connecter."
          )}
        </Typography>
        <Button
          title={t("ONBOARDING_PRONOTE_QRCODE_USE_URL", "Se connecter avec une adresse")}
          onPress={() => router.replace("/(onboarding)/pronote/url")}
          style={{ marginTop: 8 }}
        />
      </View>
    </SafeAreaView>
  );
}
