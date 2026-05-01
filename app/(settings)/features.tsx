import { Papicons } from "@getpapillon/papicons";
import { Platform, View } from "react-native";

import { useSettingsStore } from "@/stores/settings";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import NativeSwitch from "@/ui/native/NativeSwitch";
import { useTranslation } from "react-i18next";
import Icon from "@/ui/components/Icon";
import NativePicker from "@/ui/native/NativePicker";
import { useMemo } from "react";
import { getGradeDisplayScale } from "@/utils/grades/scale";
import Picker from "@/ui/components/Picker";

export default function SettingsFeatures() {
  const { t } = useTranslation();

  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  const iOSBottomAccessoryEnabled = settingsStore.iOSBottomAccessoryEnabled ?? true;
  const showTabBarLabels = settingsStore.showTabBarLabels ?? true;
  const selectedGradeScale = getGradeDisplayScale(settingsStore.gradesDisplayScale);

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
      contentInsetAdjustmentBehavior="always"
      contentContainerStyle={{ padding: 16 }}
      style={{ flex: 1 }}
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
