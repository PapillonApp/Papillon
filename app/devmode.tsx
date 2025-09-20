import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch } from "react-native";

import DevModeNotice from "@/components/DevModeNotice";
import LogIcon from "@/components/Log/LogIcon";
import { database } from "@/database";
import { useAccountStore } from '@/stores/account';
import { useLogStore } from '@/stores/logs';
import { useMagicStore } from "@/stores/magic";
import { useSettingsStore } from "@/stores/settings";
import { useAlert } from "@/ui/components/AlertProvider";
import Icon from "@/ui/components/Icon";
import Item, { Leading, Trailing } from '@/ui/components/Item';
import List from '@/ui/components/List';
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { MAGIC_URL } from "@/utils/endpoints";
import { log } from "@/utils/logger/logger";
import ModelManager from "@/utils/magic/ModelManager";

export default function Devmode() {
  const accountStore = useAccountStore();
  const logsStore = useLogStore();
  const settingStore = useSettingsStore(state => state.personalization)
  const mutateProperty = useSettingsStore(state => state.mutateProperty)
  const magicStore = useMagicStore()

  const magicStoreHomework = useMagicStore(state => state.processHomeworks)

  const { colors } = useTheme();
  const alert = useAlert();

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

      <Stack direction="horizontal" gap={10} vAlign="start" hAlign="center" style={{
        paddingHorizontal: 6,
        paddingVertical: 0,
        marginBottom: 14,
        opacity: 0.5,
      }}>
        <Icon>
          <Papicons name={"Sparkles"} size={18} />
        </Icon>
        <Typography>
          Magic+
        </Typography>
      </Stack>


      <List>
        <Item>
          <Typography>
            {settingStore.magicEnabled ? "Papillon Magic+ est Activé" : "Papillon Magic+ est Désactivé"}
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
              const result = await ModelManager.predict("ds analyse de doc", true);
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
        <Item
          onPress={() => {
            try {
              magicStore.clear();
              Alert.alert("Cache vidé", "Le cache des prédictions Magic a été vidé avec succès !");
            } catch (error) {
              Alert.alert("Erreur", `Erreur lors du vidage du cache: ${String(error)}`);
            }
          }}
        >
          <Typography variant="title">Vider le cache Magic</Typography>
          <Trailing>
            <Typography variant="caption">
              {magicStoreHomework.length} devoirs
            </Typography>
          </Trailing>
        </Item>
        <Item
          onPress={() => {
            const currentURL = settingStore.magicModelURL || MAGIC_URL;

            Alert.prompt(
              "URL Custom Magic Model",
              `URL actuelle: ${currentURL}\n\nEntrez une nouvelle URL:`,
              [
                {
                  text: "Annuler",
                  style: "cancel"
                },
                {
                  text: "Valider",
                  onPress: (newURL?: string) => {
                    if (newURL && newURL.trim()) {
                      mutateProperty("personalization", {
                        magicModelURL: newURL.trim()
                      });
                      Alert.alert("Succès", "URL du modèle Magic mise à jour!");
                    }
                  }
                }
              ],
              "plain-text",
              currentURL
            );
          }}
        >
          <Typography variant="title">Changer l&apos;URL Custom Magic</Typography>
        </Item>
        <Item
          onPress={() => {
            Alert.alert(
              "Reset URL Magic Model",
              "Voulez-vous remettre l'URL du modèle Magic par défaut?",
              [
                {
                  text: "Annuler",
                  style: "cancel"
                },
                {
                  text: "Reset",
                  style: "destructive",
                  onPress: () => {
                    mutateProperty("personalization", {
                      magicModelURL: MAGIC_URL
                    });
                    Alert.alert("Succès", "URL du modèle Magic remise par défaut!");
                  }
                }
              ]
            );
          }}
        >
          <Typography variant="title">Reset URL Magic Model</Typography>
        </Item>

      </List>
      <Stack direction="horizontal" gap={10} vAlign="start" hAlign="center" style={{
        paddingHorizontal: 6,
        paddingVertical: 0,
        marginBottom: 14,
        opacity: 0.5,
      }}>
        <Icon>
          <Papicons name={"Star"} size={18} />
        </Icon>
        <Typography>
          Alert
        </Typography>
      </Stack>

      <List>
        <Item
          onPress={() => alert.showAlert({
            title: "Connexion impossible",
            description: "Bla Bla Bla",
            icon: "TriangleAlert",
            color: "#D60046",
            technical: String(" Error: TokenExpiredError at AuthService.validateToken (file:///app/services/auth.js:45:15) at processTicksAndRejections (node:internal/process/task_queues:96:5) at async file:///app/routes/api/user.js:10:28")
          })}
        >
          <Typography variant="title">Error Alert</Typography>
        </Item>
        <Item>
          <Typography variant="title">Activer Alert au Login</Typography>
          <Trailing>
            <Switch
              value={settingStore.showAlertAtLogin}
              onValueChange={value => mutateProperty("personalization", { showAlertAtLogin: value })}
            />
          </Trailing>
        </Item>
      </List>
      <Stack direction="horizontal" gap={10} vAlign="start" hAlign="center" style={{
        paddingHorizontal: 6,
        paddingVertical: 0,
        marginBottom: 14,
        opacity: 0.5,
      }}>
        <Icon>
          <Papicons name={"Star"} size={18} />
        </Icon>
        <Typography>
          Magic Store
        </Typography>
      </Stack>

      <List>
        <Item
          onPress={() => magicStore.clear()}
        >
          <Typography variant="title">Clear Magic Store</Typography>
        </Item>
        <Item
          onPress={() => log(JSON.stringify(magicStoreHomework))}
        >
          <Typography variant="title">ConsoleLog Magic Store</Typography>
        </Item>
        <Item
          onPress={() => resetMagicCache()}
        >
          <Typography variant="title">Reset Magic Cache</Typography>
        </Item>
      </List>

      <Stack direction="horizontal" gap={10} vAlign="start" hAlign="center" style={{
        paddingHorizontal: 6,
        paddingVertical: 0,
        marginBottom: 14,
        opacity: 0.5,
      }}>
        <Icon>
          <Papicons name={"Star"} size={18} />
        </Icon>
        <Typography>
          Session
        </Typography>
      </Stack>




      <List>
        <Item
          onPress={async () => {
            await database.unsafeResetDatabase()
            await database.write(async () => {
              await database.unsafeResetDatabase()
            })
          }}
        >
          <Typography variant="title">Réinitialiser la base de données</Typography>
        </Item>
      </List>
    </ScrollView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  containerContent: {},
});
