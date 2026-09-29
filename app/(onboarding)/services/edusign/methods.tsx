import { router } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LoginView from "../../components/LoginView";

export default function EdusignOtherMethods() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const actions = [
    {
      label: t("ONBOARDING_SSO_TITLE"),
      variant: "secondary" as const,
      onPress: () => router.push("./sso"),
    },
    {
      label: t("ONBOARDING_SCHOOL_APP"),
      variant: "secondary" as const,
      onPress: () => router.push("./whitelabel"),
    },
    {
      label: t("ONBOARDING_METHOD_MICROSOFT"),
      variant: "secondary" as const,
      onPress: () =>
        router.push({ pathname: "./browser", params: { mode: "microsoft" } }),
    },
  ];

  return (
    <View
      style={{
        paddingTop: headerHeight + 12,
        paddingBottom: Math.max(insets.bottom, 20),
      }}
    >
      <LoginView
        color="#1b3e4a"
        serviceName="Edusign"
        showHeader={false}
        serviceIcon={require("@/assets/images/service_edusign.png")}
        fields={[]}
        actions={actions}
        showDisclaimer={false}
      />
    </View>
  );
}
