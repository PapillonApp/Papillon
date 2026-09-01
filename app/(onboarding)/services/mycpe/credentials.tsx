import { Href, router, useLocalSearchParams } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LoginView from "@/app/(onboarding)/components/LoginView";
import {
  getMyCpeConfiguration,
  loginMyCpe,
  MyCpeAuthenticationError,
} from "@/services/mycpe/api";
import {
  deleteMyCpeToken,
  saveMyCpeToken,
} from "@/services/mycpe/token-storage";
import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import { useAlert } from "@/ui/components/AlertProvider";
import uuid from "@/utils/uuid/uuid";

const MYCPE_COLOR = "#1759A8";

const getStringParam = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : undefined;

export default function MyCpeCredentials() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const alert = useAlert();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    accountId?: string;
    serviceId?: string;
    username?: string;
  }>();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const isMounted = useRef(true);
  const loginInFlight = useRef(false);

  useEffect(
    () => () => {
      isMounted.current = false;
    },
    []
  );

  const handleLogin = async (username: string, password: string) => {
    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password || loginInFlight.current) return;

    loginInFlight.current = true;
    setIsLoggingIn(true);
    Keyboard.dismiss();

    const requestedAccountId = getStringParam(params.accountId);
    const requestedServiceId = getStringParam(params.serviceId);
    const storeBeforeLogin = useAccountStore.getState();
    const existingAccount = storeBeforeLogin.accounts.find(
      item => item.id === requestedAccountId
    );
    const existingService = existingAccount?.services.find(
      service =>
        service.id === requestedServiceId &&
        service.serviceId === Services.MYCPE
    );
    const isReauthentication = Boolean(existingAccount && existingService);

    let serviceId = existingService?.id;
    let account: Account | undefined;
    let tokenSaved = false;
    const previousLastUsedAccount = useAccountStore.getState().lastUsedAccount;

    const rollback = async () => {
      const store = useAccountStore.getState();
      const accountIdToRollback = account?.id;
      const accountWasAdded =
        accountIdToRollback !== undefined &&
        store.accounts.some(item => item.id === accountIdToRollback);
      if (accountWasAdded && account) {
        if (!(await store.removeAccount(account))) return;
      } else if (tokenSaved && serviceId && !isReauthentication) {
        await deleteMyCpeToken(serviceId).catch(() => undefined);
      }

      const previousAccountStillExists =
        previousLastUsedAccount &&
        useAccountStore
          .getState()
          .accounts.some(item => item.id === previousLastUsedAccount);
      if (previousAccountStillExists) {
        useAccountStore.getState().setLastUsedAccount(previousLastUsedAccount);
      }
    };

    try {
      const authentication = await loginMyCpe(normalizedUsername, password);
      if (!isMounted.current) return;

      const configuration = await getMyCpeConfiguration(authentication.normal);
      if (!isMounted.current) return;

      const firstName =
        configuration.individu?.prenom?.trim() || normalizedUsername;
      const lastName = configuration.individu?.nom?.trim() || "";

      if (isReauthentication && existingAccount && existingService) {
        await saveMyCpeToken(existingService.id, authentication.normal);
        tokenSaved = true;
        if (!isMounted.current) return;

        const store = useAccountStore.getState();
        store.updateServiceAuthData(existingService.id, {
          additionals: { username: normalizedUsername },
        });
        store.setAccountName(existingAccount.id, firstName, lastName);
        store.setLastUsedAccount(existingAccount.id);

        router.dismissAll();
        router.replace("/" as Href);
        return;
      }

      const accountId = uuid();
      serviceId = uuid();
      const now = new Date().toISOString();

      account = {
        id: accountId,
        firstName,
        lastName,
        schoolName: "CPE Lyon",
        services: [
          {
            id: serviceId,
            auth: {
              additionals: { username: normalizedUsername },
            },
            serviceId: Services.MYCPE,
            createdAt: now,
            updatedAt: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      await saveMyCpeToken(serviceId, authentication.normal);
      tokenSaved = true;
      const store = useAccountStore.getState();
      store.addAccount(account);
      if (!isMounted.current) {
        await rollback();
        return;
      }

      store.setLastUsedAccount(accountId);

      router.dismissAll();
      router.replace("/" as Href);
    } catch (error) {
      await rollback();

      if (isMounted.current) {
        alert.showAlert({
          title:
            error instanceof MyCpeAuthenticationError
              ? t("Alert_Auth_Error")
              : t("ONBOARDING_ERROR"),
          description:
            error instanceof MyCpeAuthenticationError
              ? t("ONBOARDING_MYCPE_BAD_CREDENTIALS")
              : t("ONBOARDING_MYCPE_UNAVAILABLE"),
          icon:
            error instanceof MyCpeAuthenticationError
              ? "AlertTriangle"
              : "WifiOff",
          color:
            error instanceof MyCpeAuthenticationError ? "#D60046" : "#FF8C00",
          technical: error instanceof Error ? error.message : String(error),
          withoutNavbar: true,
        });
      }
    } finally {
      loginInFlight.current = false;
      if (isMounted.current) {
        setIsLoggingIn(false);
      }
    }
  };

  const contentTop = Platform.OS === "android" ? headerHeight : insets.top;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, marginBottom: insets.bottom }}
      behavior="padding"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: contentTop,
          paddingBottom: insets.bottom,
        }}
      >
        <LoginView
          color={MYCPE_COLOR}
          serviceName="My CPE Lyon"
          serviceIcon={null}
          loading={isLoggingIn}
          initialValues={{ username: getStringParam(params.username) ?? "" }}
          onSubmit={values => {
            if (values.username && values.password) {
              void handleLogin(values.username, values.password);
            }
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
