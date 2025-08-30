import { useTheme } from "@react-navigation/native";
import { Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch } from "react-native";

import DevModeNotice from "@/components/DevModeNotice";
import LogIcon from "@/components/Log/LogIcon";
import { useAccountStore } from '@/stores/account';
import { useLogStore } from '@/stores/logs';
import Item, { Leading, Trailing } from '@/ui/components/Item';
import List from '@/ui/components/List';
import Typography from "@/ui/components/Typography";
import { useSettingsStore } from "@/stores/settings";
import ModelManager from "@/utils/magic/ModelManager";

export default function Devmode() {
  const accountStore = useAccountStore();
  const logsStore = useLogStore();
  const settingStore = useSettingsStore(state => state.personalization)
  const mutateProperty = useSettingsStore(state => state.mutateProperty)

  const { colors } = useTheme();

  const [showAccountStore, setShowAccountStore] = useState(false);
  const [showLogsStore, setShowLogsStore] = useState(false);

  const [visibleLogsCount, setVisibleLogsCount] = useState(20);

  const loadMoreLogs = () => {
    setVisibleLogsCount((prev) => prev + 20);
  };

  useEffect(() => {
    if (!showLogsStore) {
      setVisibleLogsCount(20);
    }


  }, [showLogsStore]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.containerContent}
      style={styles.container}
    >
      <DevModeNotice />

      <List>
        <Item>
          <Trailing>
            <Switch
              style={{ marginRight: 10 }}
              value={showLogsStore}
              onValueChange={() => {
                requestAnimationFrame(() => {
                  setShowLogsStore(!showLogsStore);
                });
              }}
            />
          </Trailing>
          <Typography variant="title">Logs Store</Typography>
        </Item>


        {showLogsStore &&
          logsStore.logs
            .slice()
            .reverse()
            .slice(0, visibleLogsCount)
            .map((logEntry, index) => (
              <Item key={index}>
                <Leading>
                  <LogIcon type={logEntry.type} />
                </Leading>
                <Typography variant="body2">{logEntry.message}</Typography>
                <Typography variant="caption">
                  {new Date(logEntry.date).toLocaleString()} - {logEntry.from ?? "UNKNOW"}
                </Typography>
              </Item>
            ))}


        {showLogsStore && visibleLogsCount < logsStore.logs.length && (
          <Item onPress={loadMoreLogs}>
            <Leading>
              <Plus color={colors.text} size={24} />
            </Leading>
            <Typography variant="title">Charger plus</Typography>
          </Item>
        )}
        <Item onPress={() => {
          const accounts = useAccountStore.getState().accounts
          for (const account of accounts) {
            useAccountStore.getState().removeAccount(account)
          }
          Alert.alert("Success")
        }}>
          <Typography variant="title">Reset Account Store</Typography>
        </Item>
      </List>

      <List>
        <Item>
          <Typography>
            {settingStore.magicEnabled ? "true" : "false"}
          </Typography>
        </Item>
        <Item
          onPress={() => mutateProperty("personalization", { magicEnabled: !settingStore.magicEnabled })}
        >
          <Typography>
            {settingStore.magicEnabled ? "Activer" : "Desactiver"} Papillon Magic+
          </Typography>
        </Item>
        <Item
          onPress={() => ModelManager.refresh()}
        >
          <Typography variant="title">Rafraîchir le modèle</Typography>
        </Item>
        <Item
          onPress={async () => {
            try {
              const result = await ModelManager.reset();
              if (result.success) {
                Alert.alert("Succès", "Le modèle a été réinitialisé avec succès. Il sera retéléchargé au prochain démarrage.");
              } else {
                Alert.alert("Erreur", `Échec du reset: ${result.error}`);
              }
            } catch (error) {
              Alert.alert("Erreur", `Erreur lors du reset: ${String(error)}`);
            }
          }}
        >
          <Typography variant="title">Reset complet du modèle</Typography>
        </Item>
        <Item
          onPress={() => {
            const status = ModelManager.getStatus();
            Alert.alert(
              "Statut du modèle",
              `Modèle chargé: ${status.hasModel ? "Oui" : "Non"}\n` +
              `Max Length: ${status.maxLen}\n` +
              `Nombre de labels: ${status.labelsCount}\n` +
              `Taille du vocabulaire: ${status.wordIndexSize}\n` +
              `Index OOV: ${status.oovIndex}`
            );
          }}
        >
          <Typography variant="title">Afficher le statut du modèle</Typography>
        </Item>
        <Item
          onPress={async () => {
            try {
              const result = await ModelManager.predict("IL Y A UNE EVALUATION DEMAIN ATTENTION UNE EVALUATION JE DIT BIEN UNE EVALUATIOOOOOOOON", true);
              if ('error' in result) {
                Alert.alert("Erreur de prédiction", result.error);
              } else {
                Alert.alert(
                  "Test de prédiction réussi",
                  `Prédiction: ${result.predicted}\nScores: ${result.scores.slice(0, 3).map(s => s.toFixed(3)).join(', ')}...`
                );
              }
            } catch (error) {
              Alert.alert("Erreur", `Erreur lors du test: ${String(error)}`);
            }
          }}
        >
          <Typography variant="title">Tester une prédiction</Typography>
        </Item>

      </List>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  containerContent: {},
});
