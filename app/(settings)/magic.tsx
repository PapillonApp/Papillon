import { UserX2Icon } from "lucide-react-native";
import React from "react";
import { ScrollView, Text } from "react-native";

import { useAccountStore } from "@/stores/account";
import Icon from "@/ui/components/Icon";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { useTheme } from "@react-navigation/native";
import { Papicons } from "@getpapillon/papicons";
import SettingsHeader from "@/components/SettingsHeader";
import { useSettingsStore } from "@/stores/settings";
import { t } from "i18next";

export default function SettingsMagic() {
  const theme = useTheme()
  const { colors } = theme

  const settingsStore = useSettingsStore(state => state.personalization)
  const mutateProperty = useSettingsStore(state => state.mutateProperty)


  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, gap: 20 }}
      contentInsetAdjustmentBehavior="always"
    >
      <SettingsHeader
        color={theme.dark ? "#1a0b14ff" : "#FAD9EC"}
        title="Activer Magic+"
        description="Optimise automatiquement l’organisation de tes tâches pour améliorer ta productivité"
        imageSource={require("@/assets/images/magic.png")}
        onSwitchChange={(isSwitchOn) => mutateProperty("personalization", { magicEnabled: !settingsStore.magicEnabled })}
        switchValue={settingsStore.magicEnabled}
        showSwitch={true}
        switchColor={"#DD007D"}
      />
      <Typography variant="caption" color="secondary">{t("Settings_MagicPlus_ExplanationLocal")}</Typography>
    </ScrollView>
  );
}