import { Papicons } from "@getpapillon/papicons";
import { router, useFocusEffect } from "expo-router";
import { useHeaderHeight, useTheme } from "expo-router/react-navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { applyPrepaProviderChanges } from "@/services/shared";
import {
  getPrepaSelection,
  supportsPrepaCategory,
} from "@/stores/account/prepaProviders";
import { useAccountStore } from "@/stores/account";
import {
  pendingPrepaLogins,
  PrepaLogin,
} from "@/stores/account/pendingPrepaLogin";
import {
  type Account,
  type PrepaProvider,
  Services,
} from "@/stores/account/types";
import ActionMenu from "@/ui/components/ActionMenu";
import SafeHorizontalView from "@/ui/components/SafeHorizontalView";
import Button from "@/ui/new/Button";
import Typography from "@/ui/new/Typography";
import uuid from "@/utils/uuid/uuid";

const categories = [
  { id: "timetable", label: "ONBOARDING_PREPA_TIMETABLE" },
  { id: "grades", label: "Tab_Grades" },
  { id: "homework", label: "ONBOARDING_PREPA_HOMEWORK" },
] as const;

const providers = [
  {
    id: "pronote",
    service: Services.PRONOTE,
    label: "ONBOARDING_SERVICE_PRONOTE",
  },
  {
    id: "cahier-de-prepa",
    service: Services.CAHIER_DE_PREPA,
    label: "ONBOARDING_SERVICE_CAHIER_DE_PREPA",
  },
  {
    id: "prepa-plus",
    service: Services.PREPA_PLUS,
    label: "ONBOARDING_SERVICE_PREPA_PLUS",
  },
] as const;

type Category = (typeof categories)[number]["id"];

function openProvider(prepaLoginId: string, service: PrepaProvider) {
  if (service === Services.PRONOTE) {
    router.push({
      pathname: "/(onboarding)/services/pronote/locate",
      params: { prepaLoginId },
    });
  } else {
    router.push({
      pathname: "/(onboarding)/prepaCredentials" as never,
      params: { prepaLoginId, provider: String(service) },
    });
  }
}

export default function PrepaProviderSetup({ account }: { account?: Account }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const headerHeight = useHeaderHeight();
  const { bottom } = useSafeAreaInsets();
  const [selections, setSelections] = useState<
    Partial<Record<Category, PrepaProvider>>
  >(() => getPrepaSelection(account));
  const activeLogin = useRef<{ id: string; awaiting: PrepaProvider } | null>(
    null
  );
  const canConnect = categories.every(({ id }) =>
    supportsPrepaCategory(id, selections[id])
  );
  const accountId = account?.id;

  const saveSettings = useCallback(
    (flow: PrepaLogin) => {
      if (!accountId) {
        return;
      }
      useAccountStore
        .getState()
        .setPrepaServices(accountId, flow.selection, flow.services);
      void applyPrepaProviderChanges(accountId, flow.services.length > 0).catch(
        () => {
          // The manager exposes authentication failures to the data screens.
        }
      );
      router.back();
    },
    [accountId]
  );

  useEffect(
    () => () => {
      if (activeLogin.current) {
        pendingPrepaLogins.delete(activeLogin.current.id);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      const active = activeLogin.current;
      if (!active) {
        return;
      }
      const flow = pendingPrepaLogins.get(active.id);
      if (!flow || flow.next === active.awaiting) {
        pendingPrepaLogins.delete(active.id);
        activeLogin.current = null;
        return;
      }
      if (flow.next !== undefined) {
        active.awaiting = flow.next;
        openProvider(active.id, flow.next);
        return;
      }

      pendingPrepaLogins.delete(active.id);
      activeLogin.current = null;
      if (accountId) {
        saveSettings(flow);
        return;
      }

      const now = new Date().toISOString();
      const store = useAccountStore.getState();
      store.addAccount({
        id: active.id,
        firstName:
          flow.profile?.firstName || t("ONBOARDING_DEFAULT_USER_FIRSTNAME"),
        lastName: flow.profile?.lastName ?? "",
        schoolName: flow.profile?.schoolName,
        className: flow.profile?.className,
        customisation: flow.profile?.customisation,
        services: flow.services,
        prepaServices: flow.selection,
        createdAt: now,
        updatedAt: now,
      });
      store.setLastUsedAccount(active.id);
      router.dismissTo("/" as never);
    }, [accountId, saveSettings, t])
  );

  const startLogin = () => {
    const { timetable, grades, homework } = selections;
    if (
      !canConnect ||
      timetable === undefined ||
      grades === undefined ||
      homework === undefined ||
      activeLogin.current
    ) {
      return;
    }
    const id = uuid();
    const flow = new PrepaLogin(
      { timetable, grades, homework },
      account?.services,
      accountId ? "/(settings)/prepaProviders" : "/(onboarding)/prepa"
    );
    const first = flow.next;
    if (first !== undefined) {
      pendingPrepaLogins.set(id, flow);
      activeLogin.current = { id, awaiting: first };
      openProvider(id, first);
    } else {
      saveSettings(flow);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + 20,
          paddingBottom: 20,
        }}
      >
        <SafeHorizontalView base={20} style={styles.content}>
          <Typography variant="h2">{t("ONBOARDING_PREPA_TITLE")}</Typography>
          {categories.map(({ id, label }) => {
            const selectedProvider = providers.find(
              provider => provider.service === selections[id]
            );

            return (
              <View
                key={id}
                style={[
                  styles.field,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <ActionMenu
                  actions={providers.map(provider => ({
                    id: provider.id,
                    title: t(provider.label),
                    state: provider.service === selections[id] ? "on" : "off",
                    attributes: {
                      disabled: !supportsPrepaCategory(id, provider.service),
                    },
                  }))}
                  onPressAction={({ nativeEvent }) => {
                    const provider = providers.find(
                      option => option.id === nativeEvent.event
                    );
                    if (
                      provider &&
                      supportsPrepaCategory(id, provider.service)
                    ) {
                      setSelections(current => ({
                        ...current,
                        [id]: provider.service,
                      }));
                    }
                  }}
                >
                  <View style={styles.trigger}>
                    <View style={styles.labels}>
                      <Typography variant="title">{t(label)}</Typography>
                      <Typography
                        variant="body1"
                        color={selectedProvider ? "primary" : "textSecondary"}
                      >
                        {selectedProvider
                          ? t(selectedProvider.label)
                          : t("ONBOARDING_PREPA_CHOOSE_SERVICE")}
                      </Typography>
                    </View>
                    <Papicons
                      name="ChevronDown"
                      size={18}
                      color={String(colors.primary)}
                    />
                  </View>
                </ActionMenu>
              </View>
            );
          })}
        </SafeHorizontalView>
      </ScrollView>
      <SafeHorizontalView
        base={20}
        style={[
          styles.footer,
          { borderColor: colors.border, paddingBottom: bottom + 20 },
        ]}
      >
        <Button
          label={t(
            accountId ? "Settings_Prepa_Save" : "ONBOARDING_PREPA_CONNECT"
          )}
          onPress={startLogin}
          disabled={!canConnect}
          maxWidth={500}
          fullWidth
        />
      </SafeHorizontalView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: "100%", maxWidth: 540, alignSelf: "center", gap: 12 },
  field: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: 14,
  },
  labels: { flexShrink: 1, gap: 2 },
  footer: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 20,
  },
});
