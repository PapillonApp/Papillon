import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, KeyboardAvoidingView, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  loginWhitelabelAppWithCredentials,
  WHITE_LABEL_APPS,
  NewPasswordNeededError,
} from "@studentsphere/linksign";

import uuid from "@/utils/uuid/uuid";
import { getStaticDeviceId } from "@/utils/device";
import { useAlert } from "@/ui/components/AlertProvider";
import LoginView from "../../components/LoginView";
import { appLogos } from "./whitelabel";
import { completeEdusignLogin } from "./utils";

export default function WhitelabelLoginModal() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const alert = useAlert();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const {
    appPackage,
    appName,
    schoolId,
    schoolName,
    schoolLogoUrl,
  } = useLocalSearchParams<{
    appPackage: string;
    appName: string;
    schoolId: string;
    schoolName: string;
    schoolLogoUrl?: string;
  }>();

  const currentApp = WHITE_LABEL_APPS.find((a) => a.package === appPackage);
  const appLogo = currentApp?.id ? appLogos[currentApp.id] : undefined;

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: t("ONBOARDING_LOGIN_VIA", { service: appName }),
    });
  }, [appName, navigation, t]);

  const handleLogin = async (id: string, pwd: string) => {
    if (!schoolId || !id || !pwd) return;
    setIsLoggingIn(true);
    try {
      const localDeviceId = uuid();
      const staticDeviceId = await getStaticDeviceId();
      const user = await loginWhitelabelAppWithCredentials(
        id,
        pwd,
        schoolId,
        "fr",
        staticDeviceId
      );

      if (user.NEW_PASSWORD_NEEDED === 1 || user.NEW_PASSWORD_NEEDED === true) {
        throw new NewPasswordNeededError();
      }

      if (!user.TOKEN) {
        throw new Error("Invalid credentials");
      }

      await completeEdusignLogin({
        token: user.TOKEN,
        refreshToken: user.REFRESH_TOKEN,
        localDeviceId,
        selectedSchoolName: schoolName,
        authSession: user,
        navigation,
      });
    } catch (e: any) {
      if (e instanceof NewPasswordNeededError || e.name === "NewPasswordNeededError") {
        Alert.alert(
          t("Alert_New_Password_Needed_Title"),
          t("Alert_New_Password_Needed_Description")
        );
      } else {
        alert.showAlert({
          title: t("Alert_Error"),
          description: t("Alert_Bad_Credentials"),
          icon: "AlertTriangle",
          color: "#D60046",
          withoutNavbar: true,
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, marginBottom: insets.bottom }}
      behavior="padding"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: headerHeight + 12,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <LoginView
          color="#1b3e4a"
          serviceName={appName}
          serviceSubtitle={t("ONBOARDING_LOGIN_TO_SERVICE")}
          serviceIcon={
            appLogo ||
            (schoolLogoUrl
              ? { uri: schoolLogoUrl }
              : require("@/assets/images/service_edusign.png"))
          }
          disclaimerService={t("ONBOARDING_WHITELABEL_DISCLAIMER_SERVICE", {
            school: schoolName,
            app: appName,
          })}
          loading={isLoggingIn}
          fields={[
            {
              name: "identifier",
              placeholder: t("INPUT_MAIL_OR_USERNAME"),
              secureTextEntry: false,
              keyboardType: "email-address" as const,
              autoCapitalize: "none" as const,
              textContentType: "username" as const,
            },
            {
              name: "password",
              placeholder: t("INPUT_PASSWORD"),
              secureTextEntry: true,
              textContentType: "password" as const,
            },
          ]}
          actions={[
            {
              label: t("LOGIN_BTN"),
              variant: "primary" as const,
              submit: true,
            },
            {
              label: t("ONBOARDING_CANCEL"),
              variant: "secondary" as const,
              onPress: () => router.back(),
            },
          ]}
          onSubmit={(values) => {
            const id = values.identifier;
            const pwd = values.password;
            if (id && pwd && id.trim() && pwd.trim()) {
              handleLogin(id.trim(), pwd.trim());
            }
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
