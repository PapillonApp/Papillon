import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { t } from "i18next";
import { useCallback } from "react";
import React, { FlatList, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAccountStore } from "@/stores/account";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import adjust from "@/utils/adjustColor";

const AccountSelector = () => {
  const accounts = useAccountStore((state) => state.accounts);
  const setLastUsedAccount = useAccountStore((state) => state.setLastUsedAccount);
  const router = useRouter();
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  const accent = colors.primary;
  const foreground = adjust(accent, theme.dark ? 0.4 : -0.4);
  const foregroundSecondary = adjust(accent, theme.dark ? 0.6 : -0.7) + "88";

  const handleSelectAccount = useCallback(async (accountId: string) => {
    setLastUsedAccount(accountId);
    router.replace("/(tabs)");
  }, [setLastUsedAccount, router]);

  const handleAddAccount = useCallback(() => {
    router.navigate("/(onboarding)/serviceSelection");
  }, [router]);

  if (accounts.length === 0) {
    router.replace("/(onboarding)/welcome");
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[accent + "77", accent + "00"]}
        locations={[0, 0.5]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%" }}
      />

      <FlatList
        contentContainerStyle={{
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
          gap: 16,
        }}
        data={[...accounts]}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={{ marginBottom: 24 }}>
            <Stack direction="vertical" gap={12}>
              <Typography variant="h1" color={foreground} style={{ fontSize: 44 }}>
                👤
              </Typography>
              <Typography variant="h3" color={foreground}>
                {t("AccountSelector_Title", { defaultValue: "Sélectionnez un compte" })}
              </Typography>
              <Typography variant="body1" color={foregroundSecondary}>
                {t("AccountSelector_Subtitle", {
                  defaultValue: "Choisissez le compte avec lequel vous souhaitez continuer",
                })}
              </Typography>
            </Stack>
          </View>
        }
        ListFooterComponent={
          <View style={{ marginTop: 12 }}>
            <Stack direction="vertical" gap={12}>
              <AnimatedPressable onPress={handleAddAccount}>
                <Stack
                  card
                  direction="horizontal"
                  hAlign="center"
                  vAlign="center"
                  padding={16}
                  gap={12}
                  radius={16}
                >
                  <Icon size={24} papicon>
                    <Papicons name={"Plus"} color={colors.text} />
                  </Icon>
                  <Typography variant="title" color="text">
                    {t("AccountSelector_AddAccount", { defaultValue: "Ajouter un compte" })}
                  </Typography>
                </Stack>
              </AnimatedPressable>
            </Stack>
          </View>
        }
        renderItem={({ item }) => (
          <AnimatedPressable onPress={() => handleSelectAccount(item.id)}>
            <Stack
              card
              direction="horizontal"
              hAlign="center"
              vAlign="center"
              padding={16}
              gap={12}
              radius={16}
            >
              <Stack direction="vertical" gap={4} style={{ flex: 1 }}>
                <Typography variant="title" color="text" nowrap>
                  {item.firstName} {item.lastName}
                </Typography>
                <Typography variant="body2" color="secondary" nowrap>
                  {item.schoolName || t("AccountSelector_NoSchool", { defaultValue: "Pas d'école" })}
                </Typography>
                {item.className && (
                  <Typography variant="caption" color="secondary" nowrap>
                    {item.className}
                  </Typography>
                )}
              </Stack>
              <Icon size={24} papicon>
                <Papicons name={"ChevronRight"} color={colors.text} opacity={0.5} />
              </Icon>
            </Stack>
          </AnimatedPressable>
        )}
      />
    </View>
  );
};

export default AccountSelector;
