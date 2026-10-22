import { router, useNavigation, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Keyboard, KeyboardAvoidingView, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getSsoConfig,
  extractDomainFromEmail,
  createSsoAuthURL,
} from "@studentsphere/linksign";

import LoginView from "../../components/LoginView";
import { useAlert } from "@/ui/components/AlertProvider";

export default function EdusignLoginWithCredentials() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const alert = useAlert();

  const { initialEmail, initialNeedsPin } = useLocalSearchParams<{
    initialEmail?: string;
    initialNeedsPin?: string;
  }>();
  const [identifier, setIdentifier] = useState(initialEmail || "");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setIdentifier(initialEmail);
    }
  }, [initialEmail]);

  useEffect(() => {
    if (initialNeedsPin === "true") {
      router.push({
        pathname: "./authenticate",
        params: {
          identifier: initialEmail,
          initialNeedsPin: "true",
        },
      });
    }
  }, [initialNeedsPin, initialEmail]);

  const handleContinue = async (values: { [key: string]: string }) => {
    const rawId = (values.identifier || identifier || "").trim();
    if (!rawId) return;
    setIdentifier(rawId);

    setIsChecking(true);
    Keyboard.dismiss();

    const isEmail = rawId.includes("@");
    const domain = isEmail
      ? extractDomainFromEmail(rawId)
      : rawId.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    let ssoConfigObj = null;

    if (domain) {
      try {
        const config = await getSsoConfig(domain);
        if (config) {
          ssoConfigObj = config;
        }
      } catch (e) {
      }
    }

    setIsChecking(false);

    if (!isEmail && ssoConfigObj) {
      try {
        const url = createSsoAuthURL(ssoConfigObj);
        router.push({
          pathname: "./browser",
          params: {
            ssoUrl: url,
            ssoConfig: JSON.stringify(ssoConfigObj),
          },
        });
        return;
      } catch (e: any) {
        alert.showAlert({
          title: t("Alert_SSO_Error_Title"),
          description: e.message || t("Alert_SSO_Open_Error"),
          icon: "AlertTriangle",
          color: "#D60046",
          withoutNavbar: true,
        });
        return;
      }
    }
    router.push({
      pathname: "./authenticate",
      params: {
        identifier: rawId,
        ssoConfig: ssoConfigObj ? JSON.stringify(ssoConfigObj) : undefined,
        ssoDomain: domain || undefined,
      },
    });
  };

  const fields = [
    {
      name: "identifier",
      placeholder: t("INPUT_MAIL_DOMAIN_OR_USERNAME"),
      secureTextEntry: false,
      defaultValue: identifier,
      textContentType: "username" as const,
      keyboardType: "email-address" as const,
      autoCapitalize: "none" as const,
    },
  ];

  const actions = [
    {
      label: t("ONBOARDING_CONTINUE"),
      variant: "primary" as const,
      submit: true,
    },
    {
      label: t("ONBOARDING_OTHER_LOGIN_METHODS"),
      variant: "secondary" as const,
      onPress: () => router.push("./methods"),
    },
    {
      label: t("ONBOARDING_LOGIN_HELP_ACTION"),
      variant: "secondary" as const,
      onPress: () => {
        Alert.alert(t("ONBOARDING_LOGIN_HELP_TITLE"), t("ONBOARDING_LOGIN_HELP_DESCRIPTION"));
      },
    },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1, marginBottom: insets.bottom }} behavior="padding">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: insets.top + 44, paddingBottom: insets.bottom }}
      >
        <LoginView
          color="#1b3e4a"
          serviceName="Edusign"
          serviceIcon={require("@/assets/images/service_edusign.png")}
          loading={isChecking}
          fields={fields}
          actions={actions}
          onSubmit={handleContinue}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
