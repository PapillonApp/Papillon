import { useTheme, useHeaderHeight } from "expo-router/react-navigation";
import { useNavigation, useLocalSearchParams } from "expo-router";
import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { StudentAccount } from "@studentsphere/linksign";

import uuid from "@/utils/uuid/uuid";
import Typography from "@/ui/new/Typography";
import Stack from "@/ui/components/Stack";
import { useAlert } from "@/ui/components/AlertProvider";
import Search from "@/ui/components/Search";

import List from "@/ui/new/List";
import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import { Papicons } from "@getpapillon/papicons";
import { PapillonZoomIn, PapillonZoomOut } from "@/ui/utils/Transition";
import adjust from "@/utils/adjustColor";
import Button from "@/ui/new/Button";
import Divider from "@/ui/new/Divider";
import { completeEdusignLogin } from "./utils";

function SchoolLogo({ logoUrl }: { logoUrl?: string }) {
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [logoUrl]);

  const hasCustomLogo = Boolean(
    logoUrl &&
    typeof logoUrl === "string" &&
    logoUrl.trim().length > 0 &&
    !logoUrl.toLowerCase().includes("vide.png")
  );

  if (hasCustomLogo && !hasError) {
    return (
      <Image
        source={{ uri: logoUrl }}
        onError={() => setHasError(true)}
        style={{ width: 32, height: 32, borderRadius: 8 }}
        resizeMode="contain"
      />
    );
  }

  return (
    <Image
      source={require("@/assets/images/service_edusign.png")}
      style={{ width: 32, height: 32, borderRadius: 8 }}
      resizeMode="contain"
    />
  );
}

export default function EdusignSelectAccount() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors } = theme;
  const alert = useAlert();
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();

  const { accounts: accountsJson } = useLocalSearchParams<{ accounts?: string }>();

  const accounts: StudentAccount[] = useMemo(() => {
    if (!accountsJson) return [];
    try {
      return JSON.parse(accountsJson);
    } catch (e) {
      console.error("Failed to parse accounts", e);
      return [];
    }
  }, [accountsJson]);

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    accounts.length > 0 ? (accounts[0].ID || accounts[0].TOKEN) : null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const q = searchQuery.toLowerCase();
    return accounts.filter((item) => {
      const schoolName = item.SCHOOL?.NAME?.toLowerCase() || "";
      const trainingName = item.TRAINING_NAME?.toLowerCase() || "";
      const username = item.USERNAME?.toLowerCase() || "";
      const email = item.EMAIL?.toLowerCase() || "";
      const name = `${item.FIRSTNAME} ${item.LASTNAME}`.toLowerCase();
      return (
        schoolName.includes(q) ||
        trainingName.includes(q) ||
        username.includes(q) ||
        email.includes(q) ||
        name.includes(q)
      );
    });
  }, [accounts, searchQuery]);

  const selectedAccount = useMemo(() => {
    return (
      accounts.find((item) => (item.ID || item.TOKEN) === selectedAccountId) ||
      null
    );
  }, [accounts, selectedAccountId]);

  const handleContinue = async () => {
    if (!selectedAccount) return;
    setIsLoggingIn(true);
    try {
      const localDeviceId = uuid();
      await completeEdusignLogin({
        token: selectedAccount.TOKEN,
        refreshToken: selectedAccount.REFRESH_TOKEN,
        localDeviceId,
        selectedSchoolName: selectedAccount.SCHOOL?.NAME,
        authSession: selectedAccount,
        navigation,
      });
    } catch (e: any) {
      alert.showAlert({
        title: t("Alert_Error"),
        description: e.message || t("Alert_Finalize_Login_Error"),
        icon: "AlertTriangle",
        color: "#D60046",
        withoutNavbar: true,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <List
        animated
        ListHeaderComponent={
          <Stack padding={[4, 0]}>
            <Typography variant="h2">{t("ONBOARDING_SELECT_SCHOOL")}</Typography>
            <Typography variant="action" color="textSecondary">
              {t("ONBOARDING_MULTI_ACCOUNTS_DESCRIPTION")}
            </Typography>
            <Divider height={6} ghost />
            {accounts.length > 2 && (
              <>
                <Search
                  placeholder={t("ONBOARDING_SEARCH_ACCOUNT_PLACEHOLDER")}
                  style={{ width: "100%" }}
                  value={searchQuery}
                  setValue={setSearchQuery}
                  onTextChange={setSearchQuery}
                />
                <Divider height={18} ghost />
              </>
            )}
          </Stack>
        }
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
          paddingTop: headerHeight + 20,
          paddingBottom: 20,
        }}
        style={{ flex: 1 }}
      >
        {filteredAccounts.map((item, index) => {
          const accountKey = item.ID || item.TOKEN || index.toString();
          const isSelected = selectedAccountId === accountKey;

          const subtitleParts: string[] = [];
          if (item.TRAINING_NAME?.trim()) {
            subtitleParts.push(item.TRAINING_NAME.trim());
          }
          if (item.USERNAME?.trim()) {
            subtitleParts.push(item.USERNAME.trim());
          } else if (item.EMAIL?.trim()) {
            subtitleParts.push(item.EMAIL.trim());
          }
          const subtitle = subtitleParts.join(" • ");

          return (
            <List.Item
              animated
              key={accountKey}
              onPress={() => setSelectedAccountId(accountKey)}
              style={{
                backgroundColor: isSelected
                  ? adjust(colors.primary as string, theme.dark ? -0.8 : 0.9)
                  : colors.card,
                minHeight: 64,
              }}
            >
              <List.Leading>
                <SchoolLogo logoUrl={item.SCHOOL?.LOGO} />
              </List.Leading>

              <Stack gap={2} style={{ flex: 1, justifyContent: "center" }}>
                <Typography variant="title" numberOfLines={1}>
                  {item.SCHOOL?.NAME || t("ONBOARDING_UNKNOWN_SCHOOL")}
                </Typography>
                {subtitle ? (
                  <Typography variant="body2" color="textSecondary" numberOfLines={1}>
                    {subtitle}
                  </Typography>
                ) : null}
              </Stack>

              {isSelected && (
                <List.Trailing>
                  <Dynamic animated entering={PapillonZoomIn} exiting={PapillonZoomOut}>
                    <Icon fill={colors.primary as string} size={22}>
                      <Papicons name="check" />
                    </Icon>
                  </Dynamic>
                </List.Trailing>
              )}
            </List.Item>
          );
        })}
      </List>

      <View
        style={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          backgroundColor: colors.background,
        }}
      >
        <Button
          label={t("ONBOARDING_CONTINUE")}
          onPress={handleContinue}
          disabled={!selectedAccountId || isLoggingIn}
        />
      </View>
    </View>
  );
}
