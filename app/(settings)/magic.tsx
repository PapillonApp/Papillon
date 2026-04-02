import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { t } from "i18next";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";

import SettingsHeader from "@/components/SettingsHeader";
import packageJson from "@/package.json";
import { useSettingsStore } from "@/stores/settings";
import Icon from "@/ui/components/Icon";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { MAGIC_URL } from "@/utils/endpoints";
import { log } from "@/utils/logger/logger";
import ModelManager from "@/utils/magic/ModelManager";
import { checkAndUpdateModel, getCurrentPtr } from "@/utils/magic/updater";

function getMagicURL(): string {
  return useSettingsStore.getState().personalization.magicModelURL || MAGIC_URL;
}

export default function SettingsMagic() {
  const theme = useTheme();
  const { colors } = theme;

  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

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
        log("Erreur lors de la récupération du pointeur: " + error);
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
      log("Erreur lors de la récupération du pointeur: " + error);
    }
  };

  const showDetailedStatus = () => {
    if (!modelStatus) {
      return;
    }

    log(
      "Statut détaillé du modèle:" +
        JSON.stringify({
          hasModel: modelStatus.hasModel,
          modelType: modelStatus.modelType,
          hasInitialized: modelStatus.hasInitialized,
          isInitializing: modelStatus.isInitializing,
          maxLen: modelStatus.maxLen,
          batchSize: modelStatus.batchSize,
          labelsCount: modelStatus.labelsCount,
          wordIndexSize: modelStatus.wordIndexSize,
          oovIndex: modelStatus.oovIndex,
          tokenizerInfo: modelStatus.tokenizerInfo,
        })
    );
  };

  const checkForUpdates = async () => {
    if (isUpdating) {
      return;
    }

    setIsUpdating(true);
    setLastUpdateCheck(new Date());

    try {
      const result = await checkAndUpdateModel(
        packageJson.version,
        getMagicURL()
      );

      if (result.updated) {
        await ModelManager.safeInit();
        refreshStatus();
      }
    } catch (error) {
      log("Erreur lors de la vérification:" + error);
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
      log("Erreur lors de la réinitialisation:" + error);
    }
  };

  return (
    <List
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20 }}
      contentInsetAdjustmentBehavior="always"
    >
      <List.View style={{ marginBottom: 20 }}>
        <SettingsHeader
          color={theme.dark ? "#1a0b14ff" : "#FAD9EC"}
          title="Activer Magic+"
          description="Optimise automatiquement l'organisation de tes tâches pour améliorer ta productivité"
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          imageSource={require("@/assets/images/magic.png")}
          onSwitchChange={isSwitchOn => {
            if (settingsStore.magicEnabled && !isSwitchOn) {
              Alert.alert(
                "Désactivation de Magic+",
                "Papillon Magic+ sera désactivé au prochain redémarrage",
                [{ text: "OK", style: "default" }]
              );
            }

            mutateProperty("personalization", {
              magicEnabled: !settingsStore.magicEnabled,
            });
            setTimeout(refreshStatus, 100);
          }}
          switchValue={settingsStore.magicEnabled}
          showSwitch={true}
          switchColor={"#DD007D"}
        />
      </List.View>

      {settingsStore.magicEnabled && (
        <List.Section>
          <List.Item onPress={showDetailedStatus}>
            <List.Leading>
              <Icon>
                <Papicons name="sparkles" size={20} color={colors.primary} />
              </Icon>
            </List.Leading>
            <Typography>Statut du modèle</Typography>
            <List.Trailing>
              <Typography color="textSecondary">
                {modelStatus?.hasModel ? "Chargé" : "Non chargé"}
              </Typography>
            </List.Trailing>
          </List.Item>

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="butterfly" size={20} color={colors.primary} />
              </Icon>
            </List.Leading>
            <Typography>Modèle actuel</Typography>
            <List.Trailing>
              <Typography color="textPrimary" weight="semibold">
                {currentPtr
                  ? `${currentPtr.name} v${currentPtr.version}`
                  : "Aucun"}
              </Typography>
            </List.Trailing>
          </List.Item>
        </List.Section>
      )}

      {settingsStore.magicEnabled && (
        <List.Section>
          <List.Item onPress={checkForUpdates}>
            <List.Leading>
              <Icon>
                <Papicons
                  name="search"
                  size={20}
                  color={isUpdating ? "#FF8C00" : "#007BFF"}
                />
              </Icon>
            </List.Leading>
            <Typography>Vérifier les mises à jour</Typography>
            <List.Trailing>
              <Icon>
                <Papicons
                  name="chevronRight"
                  size={20}
                  color={colors.text + "50"}
                />
              </Icon>
            </List.Trailing>
          </List.Item>

          <List.Item onPress={resetModel}>
            <List.Leading>
              <Icon>
                <Papicons name="archive" size={20} color="#FF4444" />
              </Icon>
            </List.Leading>
            <Typography>Réinitialiser le modèle</Typography>
            <List.Trailing>
              <Icon>
                <Papicons
                  name="chevronRight"
                  size={20}
                  color={colors.text + "50"}
                />
              </Icon>
            </List.Trailing>
          </List.Item>
        </List.Section>
      )}

      <List.View style={{ marginTop: 20 }}>
        <Typography variant="caption" color="textSecondary">
          {t("Settings_MagicPlus_ExplanationLocal")}
        </Typography>
      </List.View>
    </List>
  );
}
