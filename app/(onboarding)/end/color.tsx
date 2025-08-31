import { Papicons } from "@getpapillon/papicons"
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Reanimated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { useTheme } from "@react-navigation/native";
import { router, useGlobalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg"

import { initializeAccountManager } from "@/services/shared";
import { useAccountStore } from "@/stores/account";
import { useSettingsStore } from "@/stores/settings";
import Button from "@/ui/components/Button";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import adjust from "@/utils/adjustColor";
import { AppColors } from "@/utils/colors";
import AppColorsSelector from "@/components/AppColorsSelector";
import { useTranslation } from "react-i18next";

export default function ChooseColorScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets()

  const local = useGlobalSearchParams()

  const accountStore = useAccountStore.getState();
  const lastUsedAccount = accountStore.accounts.find(account => account.id === accountStore.lastUsedAccount);

  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  const defaultColorData = useMemo(() =>
    AppColors.find(color => color.colorEnum === settingsStore.colorSelected) || AppColors[0],
    [settingsStore.colorSelected]
  );

  const [selectedColor, setSelectedColor] = useState<string>(defaultColorData.mainColor);

  const accountId = local.accountId ? String(local.accountId) : lastUsedAccount?.id;

  const handleColorChange = useCallback((color: string) => {
    setSelectedColor(color);

    setTimeout(() => {
      const colorData = AppColors.find(appColor => appColor.mainColor === color);
      if (colorData) {
        mutateProperty('personalization', {
          colorSelected: colorData.colorEnum
        });
      }
    }, 50);
  }, [mutateProperty]);

  const { t } = useTranslation();

  const gradientColors = useMemo(() => [selectedColor, selectedColor] as const, [selectedColor]);
  const logoKey = useMemo(() => `logo:${selectedColor}`, [selectedColor]);
  const gradientKey = useMemo(() => `gradient:${selectedColor}`, [selectedColor]);

  return (
    <View style={{ ...styles.container, marginBottom: insets.bottom }}>
      <Reanimated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(100)}
        key={gradientKey}
        style={StyleSheet.absoluteFill}
      >
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFill}
        />
      </Reanimated.View>
      <LinearGradient
        colors={[colors.background + "00", colors.background]}
        locations={[0.0498, 0.8193]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Reanimated.View style={{
        padding: 20,
        paddingTop: insets.top + 20,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "rgba(0, 0, 0, 0.25)",
        shadowOffset: { width: 0, height: 1},
        shadowOpacity: 1,
        shadowRadius: 8,
        flex: 1,
      }}
        entering={ZoomIn.springify().duration(300)}
        exiting={FadeOut.duration(100)}
        key={logoKey}
      >
        <PapillonLogo color={selectedColor} />
      </Reanimated.View>
      <View style={{ paddingHorizontal: 20, gap: 22, paddingBottom: 20 }}>
        <View>
          <Typography color={adjust(selectedColor, theme.dark ? 0.7 : -0.5)} variant="h4">{t("ONBOARDING_COLOR_TITLE")}</Typography>
          <Stack gap={0}>
            <Typography color={adjust(selectedColor, theme.dark ? 0.7 : -0.5)} variant="h2">{t("ONBOARDING_COLOR_FIRST_LINE_DESCRIPTION")}</Typography>
            <Typography style={{ marginBottom: -5 }} color={adjust(selectedColor, theme.dark ? 0.7 : -0.5)} variant="h2">{t("ONBOARDING_COLOR_SECOND_LINE_DESCRIPTION")}</Typography>
          </Stack>
        </View>
        <AppColorsSelector
          onChangeColor={handleColorChange}
          accountId={accountId}
        />
        <Typography
          style={{ paddingTop: 10, marginTop: -20 }}
          color="#7F7F7F"
          variant="caption"
        >
          {t("Settings_Personalization_Accent_Description")}
        </Typography>
        <Button
          title="Terminer"
          onPress={async () => {
            if (accountId) {
              await initializeAccountManager()
              router.push("../../(tabs)" as any)
            }
          }}
          style={{
            backgroundColor: theme.dark ? colors.border : "black",
            alignSelf: "center"
          }}
          size='large'
          icon={
            <Icon papicon size={24} fill={"white"} style={{ backgroundColor: "transparent" }}>
              <Papicons name={"Butterfly"} />
            </Icon>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});


const PapillonLogo = React.memo(({ color }: { color: string }) => (
  <Svg
    viewBox={"0 0 149 134"}
    style={{maxHeight: 150}}
  >
    <Path
      fill="#fff"
      d="M148.762 41.322c0 8.79-5.978 16.183-14.092 18.336-.777 8.967-3.333 19.698-7.241 30.496-4.041 11.164-9.145 21.346-14.478 28.797-2.439 3.409-5.391 6.907-8.835 9.611l-.695.53c-3.125 2.31-10.57 6.766-19.486 3.504v-.001c-9.654-3.533-11.993-12.948-12.624-16.113-.904-4.525-.873-9.521-.489-14.136.061-.733.134-1.478.216-2.232a80.704 80.704 0 0 1-22.317-.796c-12.216-2.166-23.62-6.355-32.203-11.994-4.266-2.803-8.477-6.387-11.564-10.874C1.824 71.9-.714 65.495.582 58.102c1.298-7.4 5.87-12.56 10.375-15.77 3.623-2.583 7.745-4.338 11.839-5.531-.938-4.711-1.305-9.658-.663-14.43l.07-.495c.771-5.14 2.975-11.459 8.506-16.126C36.474.886 43.319-.116 48.839.337c5.436.446 10.643 2.33 15.19 4.643 8.7 4.427 17.538 11.73 25.23 20.64a18.88 18.88 0 0 1 10.644-3.267c5.543 0 10.517 2.377 13.981 6.157a19.364 19.364 0 0 1 1.911.014 18.906 18.906 0 0 1 13.998-6.17c10.476 0 18.968 8.494 18.969 18.968Z"
    />
    <Path
      fill={color}
      d="M89.205 118.191c5.737 2.1 16.393-12.79 23.802-33.257 7.408-20.467 8.763-38.761 3.027-40.86-5.609-2.053-15.244 9.377-22.595 29.015-.294.785-.641 1.763-.872 2.399-7.104 20.138-9.001 40.639-3.362 42.703Z"
    />
    <Path
      fill={adjust(color, 0.5)}
      d="M36.36 12.446c3.481-2.938 7.783-3.702 11.763-3.375 3.937.323 8.014 1.727 11.931 3.72 7.858 3.997 16.27 10.976 23.66 19.833 5.642 6.76 9.584 13.71 12.194 19.998 1.427-2.342 2.881-4.443 4.34-6.273 2.275-2.854 4.799-5.354 7.527-7 2.596-1.565 6.255-2.842 10.142-1.58l.377.13.424.166c4.299 1.794 5.999 5.976 6.696 8.854.791 3.268.891 7.157.593 11.182-.604 8.146-2.969 18.438-6.818 29.07-3.848 10.633-8.616 20.047-13.363 26.68-2.346 3.278-4.913 6.197-7.615 8.195-2.46 1.818-6.64 4.013-11.266 2.32-4.931-1.805-6.477-6.774-7.04-9.6-.676-3.384-.703-7.459-.35-11.694.35-4.217 1.11-8.955 2.233-13.93a59 59 0 0 1-1.726.48c-8.263 2.155-18.78 3.024-29.81 1.068-11.33-2.009-21.551-5.845-28.922-10.688-3.675-2.415-6.917-5.261-9.157-8.519-2.264-3.29-3.746-7.393-2.961-11.868.785-4.478 3.577-7.83 6.83-10.149 3.219-2.294 7.237-3.854 11.514-4.86a55.922 55.922 0 0 1 6.247-1.081 57.562 57.562 0 0 1-2.093-6.942c-1.046-4.523-1.435-9.01-.893-13.044.535-3.979 2.083-8.174 5.542-11.093ZM112.92 51.91c-.689.646-1.492 1.51-2.389 2.635-3.42 4.291-7.309 11.256-10.794 20.478-.142.56-.343 1.191-.642 1.839-.128.4-.276.778-.44 1.136-3.338 9.54-5.4 19.01-5.996 26.165-.174 2.094-.212 3.871-.15 5.322.782-.861 1.663-1.948 2.622-3.287 3.867-5.404 8.132-13.667 11.692-23.502 3.56-9.834 5.576-18.923 6.068-25.566.159-2.147.146-3.883.029-5.22Zm-72.868 4.325c-3.545.121-6.749.528-9.486 1.172-3.24.762-5.505 1.78-6.892 2.768-1.354.965-1.49 1.6-1.51 1.711-.02.114-.107.766.842 2.145.97 1.411 2.758 3.149 5.544 4.98 5.554 3.65 13.995 6.958 23.997 8.73 3.674.652 7.279.917 10.705.886-5.958-3.086-11.834-7.591-16.902-13.663a76.568 76.568 0 0 1-6.297-8.729Zm17.415 1.48c5.873 6.556 12.844 10.39 18.968 12.037 3.248.874 6.116 1.097 8.349.883.14-.013.274-.03.405-.046-1.032-1.295-2.697-2.814-5.115-4.403-5.295-3.479-13.214-6.647-22.608-8.472ZM47.046 22.176c-1.646-.135-2.138.262-2.206.32-.09.076-.709.703-.99 2.794-.273 2.034-.129 4.865.672 8.328.691 2.987 1.828 6.253 3.408 9.614 3.402.223 6.904.646 10.446 1.274 8.302 1.472 16.007 3.927 22.433 7.038a66.72 66.72 0 0 0-7.192-10.496c-6.533-7.828-13.606-13.526-19.525-16.538-2.972-1.511-5.357-2.195-7.046-2.334Z"
    />
    <Path
      fill="#F3F3F3"
      d="M112.503 41.324c0 6.957-5.64 12.597-12.598 12.597-6.957 0-12.597-5.64-12.597-12.597 0-6.958 5.64-12.598 12.597-12.598 6.958 0 12.598 5.64 12.598 12.598Z"
    />
    <Path
      fill="#fff"
      d="M110.112 41.324c0 5.637-4.569 10.207-10.207 10.207-5.637 0-10.207-4.57-10.207-10.207 0-5.638 4.57-10.207 10.207-10.207 5.638 0 10.207 4.57 10.207 10.207Z"
    />
    <Path
      fill="#0F0F0F"
      d="M107.272 44.801a5.614 5.614 0 1 1-11.228 0 5.614 5.614 0 0 1 11.228 0Z"
    />
    <Path
      fill="#F3F3F3"
      d="M142.391 41.324c0 6.957-5.64 12.597-12.598 12.597-6.957 0-12.597-5.64-12.597-12.597 0-6.958 5.64-12.598 12.597-12.598 6.958 0 12.598 5.64 12.598 12.598Z"
    />
    <Path
      fill="#fff"
      d="M140 41.324c0 5.637-4.57 10.207-10.207 10.207-5.637 0-10.207-4.57-10.207-10.207 0-5.638 4.57-10.207 10.207-10.207 5.637 0 10.207 4.57 10.207 10.207Z"
    />
    <Path
      fill="#0F0F0F"
      d="M137.159 44.801a5.613 5.613 0 1 1-11.227 0 5.613 5.613 0 0 1 11.227 0Z"
    />
  </Svg>
));
