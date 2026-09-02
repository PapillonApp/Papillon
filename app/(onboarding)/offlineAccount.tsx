import { useHeaderHeight, useTheme } from "expo-router/react-navigation";
import { type Href, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAccountStore } from "@/stores/account";
import Stack from "@/ui/components/Stack";
import Button from "@/ui/new/Button";
import TextInput from "@/ui/new/TextInput";
import Typography from "@/ui/new/Typography";
import uuid from "@/utils/uuid/uuid";

export default function OfflineAccount() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0;

  const createAccount = () => {
    if (!canSubmit) {
      return;
    }

    const id = uuid();
    const now = new Date().toISOString();
    const store = useAccountStore.getState();

    store.addAccount({
      id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      custom: true,
      customisation: {
        profilePicture: "",
        subjects: {},
      },
      services: [],
      createdAt: now,
      updatedAt: now,
    });
    store.setLastUsedAccount(id);

    router.dismissAll();
    router.push("/" as Href);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        translucent
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          paddingTop: headerHeight + 32,
          paddingBottom: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Stack gap={8}>
          <Typography variant="h2">{t("ONBOARDING_OFFLINE_TITLE")}</Typography>
          <Typography variant="action" color="textSecondary">
            {t("ONBOARDING_OFFLINE_DESCRIPTION")}
          </Typography>

          <View style={{ height: 20 }} />

          <TextInput
            color={String(theme.colors.primary)}
            autoCapitalize="words"
            autoComplete="name-given"
            placeholder={t("ONBOARDING_FIRST_NAME")}
            returnKeyType="next"
            textContentType="givenName"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            color={String(theme.colors.primary)}
            autoCapitalize="words"
            autoComplete="name-family"
            placeholder={t("ONBOARDING_LAST_NAME")}
            returnKeyType="done"
            textContentType="familyName"
            value={lastName}
            onChangeText={setLastName}
            onSubmitEditing={createAccount}
          />
        </Stack>
      </ScrollView>

      <View
        style={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          backgroundColor: theme.colors.background,
        }}
      >
        <Button
          label={t("ONBOARDING_CREATE_ACCOUNT")}
          onPress={createAccount}
          disabled={!canSubmit}
          fullWidth
        />
      </View>
    </KeyboardAvoidingView>
  );
}
