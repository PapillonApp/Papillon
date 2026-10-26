import { Papicons } from "@getpapillon/papicons";
import * as PapillonKit from "@getpapillon/papillonkit";
import { useTheme } from "expo-router/react-navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";

import {
  getConnectedWatches,
  wearIsSupported,
} from "@/modules/papillon-wear";
import { useSettingsStore } from "@/stores/settings";
import Icon from "@/ui/components/Icon";
import Picker from "@/ui/components/Picker";
import NativeSwitch from "@/ui/native/NativeSwitch";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { getGradeDisplayScale } from "@/utils/grades/scale";
import { triggerManualWearSync } from "@/utils/wear/useWearSync";

export default function SettingsFeatures() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  const iOSBottomAccessoryEnabled = settingsStore.iOSBottomAccessoryEnabled ?? true;
  const showTabBarLabels = settingsStore.showTabBarLabels ?? true;
  const liveActivitiesEnabled = settingsStore.liveActivitiesEnabled ?? true;
  const wearOsEnabled = settingsStore.wearOsEnabled ?? true;
  const selectedGradeScale = getGradeDisplayScale(settingsStore.gradesDisplayScale);
  const [connectedWatchCount, setConnectedWatchCount] = useState(0);

  const refreshConnectedWatches = useCallback(async () => {
    if (!wearIsSupported) {
      return;
    }
    const watches = await getConnectedWatches();
    setConnectedWatchCount(watches.length);
  }, []);

  useEffect(() => {
    refreshConnectedWatches();
  }, [refreshConnectedWatches]);

  const gradeScaleOptions = [
    {
      label: "Note sur 20",
      value: "20",
    },
    {
      label: "Note sur 10",
      value: "10",
    },
    {
      label: "Note sur 5",
      value: "5",
    },
    {
      label: "Pourcentage",
      value: "percentage",
    },
  ];

  const selectedGradeScaleIndex = useMemo(() => {
    return Math.max(0, gradeScaleOptions.findIndex(option => option.value === selectedGradeScale));
  }, [selectedGradeScale]);

  return (
    <List
      contentInsetAdjustmentBehavior="automatic"
      safeHorizontalPadding={16}
      contentContainerStyle={{ paddingVertical: 16 }}
      style={{ flex: 1, backgroundColor: colors.overground }}
    >
      <List.Section>
        <List.SectionTitle>
          <List.Label>{t("Settings_Features_TabBar")}</List.Label>
        </List.SectionTitle>

        {Platform.OS === "ios" && (
          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name={"Sunrise"} />
              </Icon>
            </List.Leading>
            <Typography variant="title">{t("Settings_Features_BottomAccessory")}</Typography>
            <Typography color="textSecondary" numberOfLines={2}>
              {t("Settings_Features_BottomAccessory_Description")}
            </Typography>
            <List.Trailing>
              <NativeSwitch
                value={Platform.OS !== "ios" ? false : iOSBottomAccessoryEnabled}
                disabled={Platform.OS !== "ios"}
                onValueChange={(value) =>
                  mutateProperty("personalization", {
                    ...settingsStore,
                    iOSBottomAccessoryEnabled: value,
                  })
                }
              />
            </List.Trailing>
          </List.Item>
        )}
        <List.Item>
          <List.Leading>
            <Icon>
              <Papicons name={"Font"} />
            </Icon>
          </List.Leading>
          <Typography variant="title">{t("Settings_Features_ShowTabBarLabels")}</Typography>
          <Typography color="textSecondary" numberOfLines={2}>
            {t("Settings_Features_ShowTabBarLabels_Description")}
          </Typography>
          <List.Trailing>
            <NativeSwitch
              value={showTabBarLabels}
              onValueChange={(value) =>
                mutateProperty("personalization", {
                  ...settingsStore,
                  showTabBarLabels: value,
                })
              }
            />
          </List.Trailing>
        </List.Item>
      </List.Section>

      {PapillonKit.features.liveActivities && (
        <List.Section>
          <List.SectionTitle>
            <List.Label>{t("Settings_Features_LockScreen")}</List.Label>
          </List.SectionTitle>

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name={"Clock"} />
              </Icon>
            </List.Leading>
            <Typography variant="title">{t("Settings_Features_LiveActivities")}</Typography>
            <Typography color="textSecondary" numberOfLines={3}>
              {t("Settings_Features_LiveActivities_Description")}
            </Typography>
            <List.Trailing>
              <NativeSwitch
                value={liveActivitiesEnabled}
                onValueChange={(value) =>
                  mutateProperty("personalization", {
                    ...settingsStore,
                    liveActivitiesEnabled: value,
                  })
                }
              />
            </List.Trailing>
          </List.Item>
        </List.Section>
      )}

      {Platform.OS === "android" && wearIsSupported && (
        <List.Section>
          <List.SectionTitle>
            <List.Label>{t("Settings_Features_WearOS")}</List.Label>
          </List.SectionTitle>

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name={"Clock"} />
              </Icon>
            </List.Leading>
            <Typography variant="title">{t("Settings_Features_WearOS_Enable")}</Typography>
            <Typography color="textSecondary" numberOfLines={3}>
              {t("Settings_Features_WearOS_Enable_Description")}
            </Typography>
            <List.Trailing>
              <NativeSwitch
                value={wearOsEnabled}
                onValueChange={(value) =>
                  mutateProperty("personalization", {
                    ...settingsStore,
                    wearOsEnabled: value,
                  })
                }
              />
            </List.Trailing>
          </List.Item>

          {wearOsEnabled && (
            <List.Item
              onPress={async () => {
                await triggerManualWearSync();
                await refreshConnectedWatches();
              }}
            >
              <List.Leading>
                <Icon>
                  <Papicons name={"Sparkles"} />
                </Icon>
              </List.Leading>
              <Typography variant="title">{t("Settings_Features_WearOS_SyncNow")}</Typography>
              <Typography color="textSecondary" numberOfLines={2}>
                {connectedWatchCount > 0
                  ? t("Settings_Features_WearOS_SyncNow_Connected", {
                    count: connectedWatchCount,
                  })
                  : t("Settings_Features_WearOS_SyncNow_Disconnected")}
              </Typography>
            </List.Item>
          )}
        </List.Section>
      )}

      <List.Section>
        <List.SectionTitle>
          <List.Label>{t("Settings_Features_Grades")}</List.Label>
        </List.SectionTitle>

        <List.Item>
          <List.Leading>
            <Icon>
              <Papicons name={"Grades"} />
            </Icon>
          </List.Leading>
          <Typography variant="body2" color="primary">{t("Global_Experimental")}</Typography>
          <Typography variant="title">{t("Settings_Features_GradeScale")}</Typography>
          <Typography color="textSecondary" numberOfLines={2}>
            {t("Settings_Features_GradeScale_Description")}
          </Typography>
          <List.Trailing>
            <View style={{ width: 120, alignItems: "flex-end" }}>
              <Picker
                options={gradeScaleOptions.map(option => option.label)}
                selectedIndex={selectedGradeScaleIndex}
                onValueChange={(index) =>
                  mutateProperty("personalization", {
                    gradesDisplayScale: gradeScaleOptions[index].value as "20" | "10" | "5" | "percentage",
                  })
                }
              />
            </View>
          </List.Trailing>
        </List.Item>
      </List.Section>

    </List>
  );
}
