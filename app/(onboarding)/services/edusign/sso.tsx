import { useRoute, useTheme, useHeaderHeight } from "expo-router/react-navigation";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getSsoConfig, createSsoAuthURL, extractDomainFromEmail } from "@studentsphere/linksign";

import LoginView from "../../components/LoginView";
import Typography from '@/ui/new/Typography';
import Stack from '@/ui/components/Stack';
import { useAlert } from "@/ui/components/AlertProvider";

export default function EdusignSSO() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const alert = useAlert();
  const route = useRoute();
  const initialDomain = (route.params as any)?.domain as string | undefined;

  const [domain, setDomain] = useState(initialDomain || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialDomain) {
      handleCheckDomain(initialDomain);
    }
  }, [initialDomain]);

  const handleCheckDomain = async (searchDomain = domain) => {
    const trimmed = (searchDomain || "").trim();
    if (!trimmed) return;
    setIsLoading(true);
    try {
      const targetDomain = trimmed.includes("@")
        ? (extractDomainFromEmail(trimmed) || trimmed)
        : trimmed.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

      const config = await getSsoConfig(targetDomain);
      const url = createSsoAuthURL(config);

      router.push({
        pathname: "./browser",
        params: {
          ssoUrl: url,
          ssoConfig: JSON.stringify(config)
        }
      });
    } catch (e: any) {
      alert.showAlert({
        title: t("Alert_SSO_Error_Title"),
        description: t("Alert_SSO_Not_Found"),
        icon: "AlertTriangle",
        color: "#D60046",
        withoutNavbar: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, marginBottom: insets.bottom }} behavior="padding">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: headerHeight + 12, paddingBottom: insets.bottom }}
      >
        <LoginView
          color="#1b3e4a"
          serviceName="Edusign"
          showHeader={false}
          serviceIcon={require('@/assets/images/service_edusign.png')}
          loading={isLoading}
          fields={[
            {
              name: "domain",
              placeholder: t("INPUT_DOMAIN_OR_MAIL"),
              secureTextEntry: false,
              keyboardType: "email-address" as const,
              autoCapitalize: "none" as const,
              autoCorrect: false,
            }
          ]}
          actions={[
            {
              label: t("ONBOARDING_CONTINUE"),
              variant: "primary" as const,
              submit: true,
            }
          ]}
          onSubmit={(values) => {
            const d = values.domain;
            if (d && d.trim()) {
              handleCheckDomain(d.trim());
            }
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
