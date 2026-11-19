import { router, useNavigation, useLocalSearchParams } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Keyboard, KeyboardAvoidingView, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  loginWithCredentials,
  verifyPin,
  getSchools,
  createSsoAuthURL,
  type SsoConfig,
  NewPasswordNeededError,
} from "@studentsphere/linksign";

import { getStaticDeviceId } from "@/utils/device";
import uuid from "@/utils/uuid/uuid";
import LoginView from "../../components/LoginView";
import { useAlert } from "@/ui/components/AlertProvider";
import { completeEdusignLogin } from "./utils";

type Step = "sso" | "password" | "pin";

export default function EdusignAuthenticateModal() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { t } = useTranslation();
  const alert = useAlert();

  const {
    identifier: paramIdentifier,
    ssoConfig: ssoConfigStr,
    ssoDomain: paramSsoDomain,
    initialNeedsPin,
    fromSso,
  } = useLocalSearchParams<{
    identifier?: string;
    ssoConfig?: string;
    ssoDomain?: string;
    initialNeedsPin?: string;
    fromSso?: string;
  }>();

  const [identifier, setIdentifier] = useState(paramIdentifier || "");
  const [ssoConfig, setSsoConfig] = useState<SsoConfig | null>(() => {
    if (ssoConfigStr) {
      try {
        return JSON.parse(ssoConfigStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [ssoDomain, setSsoDomain] = useState(paramSsoDomain || "");
  const [step, setStep] = useState<Step>(() => {
    if (initialNeedsPin === "true") return "pin";
    if (ssoConfigStr) return "sso";
    return "password";
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const isCompletingLoginRef = React.useRef(false);

  useEffect(() => {
    if (paramIdentifier) {
      setIdentifier(paramIdentifier);
    }
  }, [paramIdentifier]);

  useEffect(() => {
    if (initialNeedsPin === "true") {
      setStep("pin");
    }
  }, [initialNeedsPin]);

  useEffect(() => {
    let title = t("ONBOARDING_LOGIN_WITH_PASSWORD");
    if (step === "pin") {
      title = t("ONBOARDING_VERIFICATION_CODE_TITLE");
    } else if (step === "sso") {
      title = t("ONBOARDING_SSO_TITLE");
    }
    navigation.setOptions({
      headerTitle: title,
    });
  }, [step, navigation, t]);

  const handleSsoConnect = () => {
    if (!ssoConfig) return;
    try {
      const url = createSsoAuthURL(ssoConfig);
      router.push({
        pathname: "./browser",
        params: {
          ssoUrl: url,
          ssoConfig: JSON.stringify(ssoConfig),
        },
      });
    } catch (e: any) {
      alert.showAlert({
        title: t("Alert_SSO_Error_Title"),
        description: e.message || t("Alert_SSO_Open_Error"),
        icon: "AlertTriangle",
        color: "#D60046",
        withoutNavbar: true,
      });
    }
  };

  const handlePasswordSubmit = async (values: { [key: string]: string }) => {
    const id = (values.identifier || identifier || "").trim();
    const pwd = (values.password || "").trim();

    if (!id || !pwd) return;
    setIdentifier(id);

    setIsLoggingIn(true);
    Keyboard.dismiss();
    try {
      const localDeviceId = uuid();
      const staticDeviceId = await getStaticDeviceId();
      const user = await loginWithCredentials(id, pwd, "fr", staticDeviceId);

      if (user.NEW_PASSWORD_NEEDED === 1 || user.NEW_PASSWORD_NEEDED === true) {
        throw new NewPasswordNeededError();
      }

      if (user.NUMBER_OF_ACCOUNTS > 1) {
        setStep("pin");
        Alert.alert(
          t("Alert_Pin_Verification_Title"),
          t("Alert_Pin_Verification_Description")
        );
      } else {
        if (!user.TOKEN) {
          throw new Error("Invalid credentials");
        }
        isCompletingLoginRef.current = true;
        await completeEdusignLogin({
          token: user.TOKEN,
          refreshToken: user.REFRESH_TOKEN,
          localDeviceId,
          authSession: user,
          navigation,
        });
      }
    } catch (e: any) {
      if (e instanceof NewPasswordNeededError || e.name === "NewPasswordNeededError") {
        Alert.alert(
          t("Alert_New_Password_Needed_Title"),
          t("Alert_New_Password_Needed_Description")
        );
      } else if (
        e.name === "UnauthorizedError" ||
        e.message === "UnauthorizedError" ||
        e.message === "Invalid credentials" ||
        e.message?.includes("401") ||
        e.message?.includes("Identifiants")
      ) {
        alert.showAlert({
          title: t("Alert_Auth_Error"),
          description: t("Alert_Auth_Bad_Creds"),
          icon: "AlertTriangle",
          color: "#D60046",
          withoutNavbar: true,
        });
      } else {
        console.error("EDUSIGN LOGIN CATCH:", e);
        alert.showAlert({
          title: t("Alert_Connexion_Fail"),
          description: e.message || t("Alert_Generic_Error"),
          icon: "AlertTriangle",
          color: "#D60046",
          withoutNavbar: true,
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePinSubmit = async (values: { [key: string]: string }) => {
    const pin = (values.pinCode || "").trim();
    if (!pin) return;

    setIsLoggingIn(true);
    Keyboard.dismiss();
    try {
      const device = uuid();
      const pinResult = await verifyPin(identifier, pin);

      const schools = await getSchools(pinResult.v2Token);
      if (schools && schools.length > 0) {
        if (schools.length === 1) {
          const selected = schools[0];
          isCompletingLoginRef.current = true;
          await completeEdusignLogin({
            token: selected.TOKEN,
            refreshToken: selected.REFRESH_TOKEN,
            localDeviceId: device,
            selectedSchoolName: selected.SCHOOL?.NAME,
            authSession: selected,
            navigation,
          });
        } else {
          router.push({
            pathname: "./select-account",
            params: {
              accounts: JSON.stringify(schools),
            },
          });
        }
      } else {
        alert.showAlert({
          title: t("Alert_Error"),
          description: t("Alert_No_Schools_Found"),
          icon: "AlertTriangle",
          color: "#D60046",
          withoutNavbar: true,
        });
      }
    } catch (e: any) {
      alert.showAlert({
        title: t("Alert_Invalid_PIN_Title"),
        description: e.message || t("Alert_Invalid_PIN_Description"),
        icon: "AlertTriangle",
        color: "#D60046",
        withoutNavbar: true,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubmit = (values: { [key: string]: string }) => {
    if (step === "sso") {
      handleSsoConnect();
    } else if (step === "password") {
      handlePasswordSubmit(values);
    } else if (step === "pin") {
      handlePinSubmit(values);
    }
  };

  const fields = useMemo(() => {
    if (step === "pin") {
      return [
        {
          name: "pinCode",
          placeholder: t("INPUT_PIN"),
          secureTextEntry: false,
          keyboardType: "number-pad" as const,
        },
      ];
    }

    if (step === "sso") {
      return [
        {
          name: "identifier",
          placeholder: t("INPUT_DOMAIN_OR_MAIL"),
          secureTextEntry: false,
          value: identifier,
          editable: false,
          textContentType: "username" as const,
        },
      ];
    }

    // step === "password"
    return [
      {
        name: "identifier",
        placeholder: t("INPUT_MAIL_OR_USERNAME"),
        secureTextEntry: false,
        defaultValue: identifier,
        textContentType: "username" as const,
        keyboardType: "email-address" as const,
        autoCapitalize: "none" as const,
      },
      {
        name: "password",
        placeholder: t("INPUT_PASSWORD"),
        secureTextEntry: true,
        textContentType: "password" as const,
      },
    ];
  }, [step, identifier, t]);

  const actions = useMemo(() => {
    if (step === "pin") {
      return [
        {
          label: t("ONBOARDING_VERIFY_CODE_ACTION"),
          variant: "primary" as const,
          submit: true,
        },
        {
          label: t("ONBOARDING_CANCEL"),
          variant: "secondary" as const,
          onPress: () => {
            if (fromSso === "true" || initialNeedsPin === "true") {
              router.back();
            } else {
              setStep("password");
            }
          },
        },
      ];
    }

    if (step === "sso") {
      const displayDomain = ssoDomain || (identifier.includes("@") ? identifier.split("@")[1] : identifier);
      return [
        {
          label: t("ONBOARDING_LOGIN_WITH_DOMAIN", { domain: displayDomain }),
          variant: "primary" as const,
          submit: true,
          onPress: handleSsoConnect,
        },
        {
          label: t("ONBOARDING_LOGIN_WITH_PASSWORD"),
          variant: "secondary" as const,
          onPress: () => setStep("password"),
        },
        {
          label: t("ONBOARDING_CANCEL"),
          variant: "secondary" as const,
          onPress: () => router.back(),
        },
      ];
    }

    // step === "password"
    return [
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
    ];
  }, [step, ssoDomain, fromSso, initialNeedsPin, t]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, marginBottom: insets.bottom }}
      behavior="padding"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: headerHeight + 12,
          paddingBottom: insets.bottom,
        }}
      >
        <LoginView
          key={step}
          color="#1b3e4a"
          serviceName="Edusign"
          serviceIcon={require("@/assets/images/service_edusign.png")}
          loading={isLoggingIn}
          showHeader={false}
          fields={fields}
          actions={actions}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
