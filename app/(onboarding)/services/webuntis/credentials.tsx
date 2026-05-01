import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import uuid from "@/utils/uuid/uuid";
import { ScrollView } from "react-native-gesture-handler";
import LoginView from "../../components/LoginView";
import { useHeaderHeight } from "@react-navigation/elements";
import { Credentials, School, WebUntisClient } from "webuntis-client";
import { useSettingsStore } from "@/stores/settings";

const ANIMATION_DURATION = 170;

export default function WebUntisLoginCredentials() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const { chosenSchool } = useLocalSearchParams<{ chosenSchool: string }>();
  const selectedSchool = chosenSchool ? JSON.parse(chosenSchool) as School : null;

  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const keyboardListeners = useMemo(
    () => ({
      show: () => {
        opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
        scale.value = withTiming(0.8, { duration: ANIMATION_DURATION });
      },
      hide: () => {
        opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
        scale.value = withTiming(1, { duration: ANIMATION_DURATION });
      },
    }),
    [opacity]
  );

  useEffect(() => {
    const showSub = Keyboard.addListener(
      "keyboardWillShow",
      keyboardListeners.show
    );
    const hideSub = Keyboard.addListener(
      "keyboardWillHide",
      keyboardListeners.hide
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardListeners]);

  const handleLogin = async (
    school: string,
    username: string,
    password: string
  ) => {
    const credentials = new Credentials(school, username, password);
    const client = new WebUntisClient(credentials);

    const accountStore = useAccountStore.getState();
    const device = uuid();

    try {
      await client.auth.login(
        credentials.username,
        credentials.password
      );

      const displayName = await client.data.getPersonDisplayName();
      const tenantName = await client.data.getTenantName();

      const parts = displayName.split(" ");
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ");

      const createdAt = new Date().toISOString();

      const account: Account = {
        id: device,
        firstName: firstName,
        lastName: lastName,
        schoolName: tenantName,
        services: [
          {
            id: device,
            auth: {
              additionals: {
                school: school,
                username: username,
                password: password,
                deviceUUID: device,
              },
            },
            serviceId: Services.WEBUNTIS,
            createdAt: createdAt,
            updatedAt: createdAt,
          },
        ],
        createdAt: createdAt,
        updatedAt: createdAt,
      };

      accountStore.addAccount(account);
      accountStore.setLastUsedAccount(device);

      const settingsStore = useSettingsStore.getState();
      const disabledTabs = settingsStore.personalization.disabledTabs || [];
      const newDisabledTabs = Array.from(new Set([...disabledTabs, "news", "grades"]));

      settingsStore.mutateProperty("personalization", {
        disabledTabs: newDisabledTabs
      });

      // TODO: Use new route
      queueMicrotask(() => {
        router.push({
          pathname: "../end/color",
          params: { accountId: device },
        });
      });
    } catch ( e ) {
      setIsLoggingIn(false);

      Alert.alert(t("Alert_Auth_Error"), t("ONBOARDING_ALERT_LOGIN_ABORTED"));
    }
  };

  const login = async (school: string, username: string, password: string) => {
    const cleanedSchool = school.trim();
    const cleanedUsername = username.trim();
    const cleanedPassword = password.trim();

    if ( !cleanedSchool || !cleanedUsername || !cleanedPassword ) {
      return;
    }

    setIsLoggingIn(true);
    Keyboard.dismiss();

    await handleLogin(cleanedSchool, cleanedUsername, cleanedPassword);

    setIsLoggingIn(false);
  };

  const headerHeight = useHeaderHeight();
  const finalHeaderHeight = Platform.select({
    android: headerHeight,
    default: insets.top,
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, marginBottom: insets.bottom }}
      behavior="padding"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: finalHeaderHeight,
          paddingBottom: insets.bottom,
        }}
      >
        <LoginView
          color={"#ff6f00"}
          serviceName="WebUntis"
          serviceIcon={require("@/assets/images/service_webuntis.png")}
          loading={isLoggingIn}
          fields={[
            ...(!selectedSchool ? [{
              name: "school",
              placeholder: t("INPUT_ETABID"),
              secureTextEntry: false,
              textContentType: "username" as const
            }] : []),
            {
              name: "username",
              placeholder: t("INPUT_USERNAME"),
              secureTextEntry: false,
              textContentType: "username" as const
            },
            {
              name: "password",
              placeholder: t("INPUT_PASSWORD"),
              secureTextEntry: true,
              textContentType: "password" as const
            },
          ]}
          actions={[
            {
              label: t("LOGIN_BTN"),
              variant: "primary" as const,
              submit: true,
            }
          ]}
          onSubmit={values => {
            if ( !isLoggingIn && (selectedSchool || values.school) && values.username && values.password ) {
              const school = selectedSchool?.loginName ?? values.school;
              const username = values.username;
              const password = values.password;

              void login(school, username, password);
            }
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
