import { router, useLocalSearchParams } from "expo-router";
import { useHeaderHeight, useTheme } from "expo-router/react-navigation";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import OnboardingInput from "@/components/onboarding/OnboardingInput";
import {
  CahierDePrepa,
  normalizeCahierDePrepaUrl,
} from "@/services/cahierDePrepa";
import { PrepaPlus } from "@/services/prepaPlus";
import { getPrepaPlusOrigin } from "@/services/prepaPlus/login";
import { pendingPrepaLogins } from "@/stores/account/pendingPrepaLogin";
import { Services } from "@/stores/account/types";
import SafeHorizontalView from "@/ui/components/SafeHorizontalView";
import Button from "@/ui/new/Button";
import Typography from "@/ui/new/Typography";
import { finishPrepaLogin } from "@/utils/services/finishPrepaLogin";
import uuid from "@/utils/uuid/uuid";

function getCahierDePrepaUrl(input: string) {
  const value = input.trim();
  const url = new URL(value.includes("://") ? value : `https://${value}`);
  if (
    url.protocol !== "https:" ||
    !(
      url.hostname === "cahier-de-prepa.fr" ||
      url.hostname.endsWith(".cahier-de-prepa.fr")
    ) ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname === "/"
  ) {
    throw new Error("Invalid Cahier de Prépa school address.");
  }
  return normalizeCahierDePrepaUrl(url.toString());
}

export default function PrepaCredentials() {
  const { prepaLoginId, provider } = useLocalSearchParams<{
    prepaLoginId?: string;
    provider?: string;
  }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const headerHeight = useHeaderHeight();
  const { bottom } = useSafeAreaInsets();
  const [address, setAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  const service =
    provider === String(Services.CAHIER_DE_PREPA)
      ? Services.CAHIER_DE_PREPA
      : provider === String(Services.PREPA_PLUS)
        ? Services.PREPA_PLUS
        : undefined;
  const flow = prepaLoginId ? pendingPrepaLogins.get(prepaLoginId) : undefined;
  const cahier = service === Services.CAHIER_DE_PREPA;
  const providerName = t(
    cahier
      ? "ONBOARDING_SERVICE_CAHIER_DE_PREPA"
      : "ONBOARDING_SERVICE_PREPA_PLUS"
  );

  const signIn = async () => {
    if (
      !prepaLoginId ||
      !service ||
      flow?.next !== service ||
      inFlight.current ||
      !address.trim() ||
      !username.trim() ||
      !password
    ) {
      return;
    }
    let baseUrl: string;
    try {
      baseUrl = cahier
        ? getCahierDePrepaUrl(address)
        : getPrepaPlusOrigin(address);
    } catch {
      Alert.alert(
        t("Alert_Auth_Error"),
        t("ONBOARDING_PREPA_INVALID_ADDRESS", { service: providerName })
      );
      return;
    }

    inFlight.current = true;
    setBusy(true);
    const id = uuid();
    const auth = {
      additionals: { baseUrl, username: username.trim(), password },
    };
    try {
      const client = cahier ? new CahierDePrepa(id) : new PrepaPlus();
      await client.refreshAccount(auth);
      const now = new Date().toISOString();
      finishPrepaLogin(prepaLoginId, {
        id,
        serviceId: service,
        auth,
        createdAt: now,
        updatedAt: now,
      });
    } catch {
      if (pendingPrepaLogins.has(prepaLoginId)) {
        Alert.alert(t("Alert_Auth_Error"), t("ONBOARDING_ALERT_LOGIN_ABORTED"));
      }
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: headerHeight + 20,
          paddingBottom: bottom + 20,
        }}
      >
        <SafeHorizontalView
          base={20}
          style={{ width: "100%", maxWidth: 540, alignSelf: "center", gap: 12 }}
        >
          {service !== undefined && flow?.next === service ? (
            <>
              <Typography variant="h2">{providerName}</Typography>
              <Typography variant="body1" color="textSecondary">
                {t("ONBOARDING_PREPA_SCHOOL_ADDRESS")}
              </Typography>
              <OnboardingInput
                icon="Link"
                placeholder={
                  cahier
                    ? "https://cahier-de-prepa.fr/…"
                    : "https://….prepas-plus.fr"
                }
                text={address}
                setText={setAddress}
                inputProps={{
                  keyboardType: "url",
                  autoCapitalize: "none",
                  autoCorrect: false,
                }}
              />
              <OnboardingInput
                icon="User"
                placeholder={t("INPUT_USERNAME")}
                text={username}
                setText={setUsername}
                inputProps={{
                  autoCapitalize: "none",
                  autoCorrect: false,
                  autoComplete: "username",
                }}
              />
              <OnboardingInput
                icon="Lock"
                placeholder={t("INPUT_PASSWORD")}
                text={password}
                setText={setPassword}
                isPassword
                inputProps={{
                  autoComplete: "current-password",
                  onSubmitEditing: () => void signIn(),
                }}
              />
              <Button
                label={t(busy ? "ONBOARDING_LOADING_LOGIN" : "LOGIN_BTN")}
                disabled={
                  busy || !address.trim() || !username.trim() || !password
                }
                onPress={() => void signIn()}
                fullWidth
              />
            </>
          ) : (
            <Button
              label={t("Global_Back")}
              onPress={() => router.back()}
              fullWidth
            />
          )}
        </SafeHorizontalView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
