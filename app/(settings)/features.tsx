import { Papicons } from "@getpapillon/papicons";
import { Platform } from "react-native";

import { useSettingsStore } from "@/stores/settings";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import NativeSwitch from "@/ui/native/NativeSwitch";
import { useTranslation } from "react-i18next";
import Icon from "@/ui/components/Icon";

export default function SettingsFeatures() {
  const { t } = useTranslation();

  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  const iOSBottomAccessoryEnabled = settingsStore.iOSBottomAccessoryEnabled ?? true;
  const showTabBarLabels = settingsStore.showTabBarLabels ?? true;

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
    </List>
  );
}
