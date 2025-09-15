import { UserX2Icon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, Alert } from "react-native";

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
import ModelManager from "@/utils/magic/ModelManager";
import { getCurrentPtr, checkAndUpdateModel } from "@/utils/magic/updater";
import packageJson from "@/package.json";
import { Colors } from "@/utils/colors";
import { MAGIC_URL } from "@/utils/endpoints";

function getMagicURL(): string {
  return useSettingsStore.getState().personalization.magicModelURL || MAGIC_URL;
}

export default function SettingsMagic() {
  const theme = useTheme()
  const { colors } = theme

  const settingsStore = useSettingsStore(state => state.personalization)
  const mutateProperty = useSettingsStore(state => state.mutateProperty)

  const [modelStatus, setModelStatus] = useState<any>(null);
  const [currentPtr, setCurrentPtr] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateCheck, setLastUpdateCheck] = useState<Date | null>(null);

  useEffect(() => {
    const updateStatus = async () => {
      const status = ModelManager.getStatus();
      setModelStatus(status);

      try {
        const ptr = await getCurrentPtr();
        setCurrentPtr(ptr);
      } catch (error) {
        console.log("Erreur lors de la récupération du pointeur:", error);
      }
    };

    updateStatus();
  }, []);

  const refreshStatus = async () => {
    const status = ModelManager.getStatus();
    setModelStatus(status);

    try {
      const ptr = await getCurrentPtr();
      setCurrentPtr(ptr);
    } catch (error) {
      console.log("Erreur lors de la récupération du pointeur:", error);
    }
  };

  const showDetailedStatus = () => {
    if (!modelStatus) return;

    console.log("Statut détaillé du modèle:", {
      hasModel: modelStatus.hasModel,
      modelType: modelStatus.modelType,
      hasInitialized: modelStatus.hasInitialized,
      isInitializing: modelStatus.isInitializing,
      maxLen: modelStatus.maxLen,
      batchSize: modelStatus.batchSize,
      labelsCount: modelStatus.labelsCount,
      wordIndexSize: modelStatus.wordIndexSize,
      oovIndex: modelStatus.oovIndex,
      tokenizerInfo: modelStatus.tokenizerInfo
    });
  };

  const checkForUpdates = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    setLastUpdateCheck(new Date());

    try {
      const result = await checkAndUpdateModel(packageJson.version, getMagicURL());

      if (result.updated) {
        await ModelManager.safeInit();
        refreshStatus();
      }
    } catch (error) {
      console.log("Erreur lors de la vérification:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const resetModel = async () => {
    try {
      const result = await ModelManager.reset();
      if (result.success) {
        refreshStatus();
      }
    } catch (error) {
      console.log("Erreur lors de la réinitialisation:", error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, gap: 20 }}
      contentInsetAdjustmentBehavior="always"
    >
      <SettingsHeader
        color={theme.dark ? "#1a0b14ff" : "#FAD9EC"}
        title="Activer Magic+"
        description="Optimise automatiquement l'organisation de tes tâches pour améliorer ta productivité"
        imageSource={require("@/assets/images/magic.png")}
        onSwitchChange={(isSwitchOn) => {
          if (settingsStore.magicEnabled && !isSwitchOn) {
            Alert.alert(
              "Désactivation de Magic+",
              "Papillon Magic+ sera désactivé au prochain redémarrage",
              [{ text: "OK", style: "default" }]
            );
          }

          mutateProperty("personalization", { magicEnabled: !settingsStore.magicEnabled });
          setTimeout(refreshStatus, 100);
        }}
        switchValue={settingsStore.magicEnabled}
        showSwitch={true}
        switchColor={"#DD007D"}
      />

      {settingsStore.magicEnabled && (
        <>
          <List>
            <Item onPress={showDetailedStatus}>
              <Leading>
                <Icon>
                  <Papicons name="sparkles" size={20} color={colors.primary} />
                </Icon>
              </Leading>
              <Typography>
                Statut du modèle
              </Typography>
              <Trailing>
                <Typography color="secondary">
                  {modelStatus?.hasModel ? "Chargé" : "Non chargé"}
                </Typography>
              </Trailing>
            </Item>

            <Item>
              <Leading>
                <Icon>
                  <Papicons name="butterfly" size={20} color={colors.primary} />
                </Icon>
              </Leading>
              <Typography>
                Modèle actuel
              </Typography>
              <Trailing>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>
                  {currentPtr ? `${currentPtr.name} v${currentPtr.version}` : "Aucun"}
                </Text>
              </Trailing>
            </Item>
          </List>

          <List>
            <Item onPress={checkForUpdates}>
              <Leading>
                <Icon>
                  <Papicons name="search" size={20} color={isUpdating ? "#FF8C00" : "#007BFF"} />
                </Icon>
              </Leading>
              <Typography>
                Vérifier les mises à jour
              </Typography>
              <Trailing>
                <Icon>
                  <Papicons name="chevronRight" size={20} color={colors.text + "50"} />
                </Icon>
              </Trailing>
            </Item>

            <Item onPress={resetModel}>
              <Leading>
                <Icon>
                  <Papicons name="archive" size={20} color="#FF4444" />
                </Icon>
              </Leading>
              <Typography>
                Réinitialiser le modèle
              </Typography>
              <Trailing>
                <Icon>
                  <Papicons name="chevronRight" size={20} color={colors.text + "50"} />
                </Icon>
              </Trailing>
            </Item>
          </List>
        </>
      )}

      <Typography variant="caption" color="secondary">{t("Settings_MagicPlus_ExplanationLocal")}</Typography>
    </ScrollView>
  );
}
