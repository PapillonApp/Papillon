import React, { useMemo, useState } from "react";
import { Alert, Switch, View } from "react-native";
import { router } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import { Papicons } from "@getpapillon/papicons";

import { useLogStore, useNetworkStore } from "@/stores/logs";
import List from "@/ui/new/List";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/new/Typography";
import Icon from "@/ui/components/Icon";
import SectionHeader from "@/ui/components/SectionHeader";
import { useTheme } from "@react-navigation/native";
import Button from "@/ui/new/Button";
import { database } from "@/database";
import { useAccountStore } from "@/stores/account";
import { useSettingsStore } from "@/stores/settings";
import { useMagicStore } from "@/stores/magic";
import ModelManager from "@/utils/magic/ModelManager";
import { MAGIC_URL } from "@/utils/endpoints";
import { initializeTransport } from "@/utils/transport";
import LogIcon from "@/components/Log/LogIcon";

const HOSTS: Record<string, { title: string; icon: string }> = {
  "index-education": { title: "PRONOTE", icon: "Pronote" },
  "ecoledirecte.com": { title: "École Directe", icon: "EcoleDirecte" },
  "api.skolengo.com": { title: "Skolengo", icon: "Skolengo" },
  "analytics.papillon.bzh": { title: "Télémétrie", icon: "PapillonIcon" },
  "github.com": { title: "Ressource(s)", icon: "Code" },
  "transitapp.com": { title: "Transport", icon: "Metro" },
  "geopf.fr": { title: "Localisation", icon: "MapPin" }
};

export default function DevMode() {
  const theme = useTheme();
  const { colors } = theme;
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const [logsVisible, setLogsVisible] = useState<boolean>(false);
  const hosts = useNetworkStore((state) => state.hosts);
  const headerHeight = useHeaderHeight();

  const entries = useMemo(() => {
    return Array.from(hosts.entries())
      .map(([urlStr, data]) => ({
        url: new URL(urlStr),
        count: data.requests.length,
        rawUrl: urlStr
      }))
      .sort((a, b) => b.count - a.count);
  }, [hosts]);

  const renderHostRow = (item: typeof entries[0]) => {
    const match = Object.entries(HOSTS).find(([key]) => item.url.host.toLowerCase().includes(key));
    const classification = match ? match[1] : { title: item.url.host, icon: "Globe" };
    const isSecure = item.url.protocol === "https:";

    return (
      <List.Item 
        key={item.rawUrl} 
        onPress={() => router.push({
          pathname: "/(dev)/requests",
          params: { host: `${item.url.protocol}//${item.url.host}` }
        })}
      >
        <List.Leading>
          <Stack direction="horizontal" gap={10}>
            <Papicons
              name={isSecure ? "Lock" : "Unlock"}
              color={isSecure ? "#6BAE00" : "#C50017"}
            />
            <Papicons name={classification.icon} opacity={0.8} color={colors.text} />
          </Stack>
        </List.Leading>

        <Stack>
          <Typography variant="title" numberOfLines={1}>
            {classification.title}
          </Typography>
          <Typography color="textSecondary" variant="body1" numberOfLines={1}>
            {item.url.host}
          </Typography>
        </Stack>

        <List.Trailing>
          <Stack direction="horizontal" hAlign="center" gap={4}>
            <Typography variant="body1" weight="bold">{item.count}</Typography>
            <Papicons name="ChevronRight" color={colors.text} size={16} />
          </Stack>
        </List.Trailing>
      </List.Item>
    );
  };

  async function ClearWatermelon() {
    await database.write(async () => {
      await database.unsafeResetDatabase();
    });
  }

  async function ClearSettings() {
    useSettingsStore.getState().reset();
  }

  async function ClearAccounts() {
    useAccountStore.getState().reset();
  }
  async function ClearMagicCache() {
    useMagicStore.getState().clear();
  }

  const handleDangerousAction = (action: () => void) => {
    Alert.alert(
      "Confirmation",
      `Es-tu sûr de vouloir faire cette opération ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          style: "destructive",
          onPress: async () => {
            await action();
            Alert.alert("Succès", `Cette opération a été effectué avec succès.`);
          },
        },
      ]
    );
  };

  const resetModel = async () => {
    try {
      const result = await ModelManager.reset();
      if (result.success) {
        Alert.alert(
          "Succès",
          "Le modèle a été réinitialisé avec succès. Il sera retéléchargé au prochain démarrage."
        );
      } else {
        Alert.alert("Erreur", `Échec du reset: ${result.error}`);
      }
    } catch (error) {
      Alert.alert("Erreur", `Erreur lors du reset: ${String(error)}`);
    }
  }

  const handlePress = async (action: () => void) => {
    await action();
    Alert.alert("Succès", `Cette opération a été effectué avec succès.`);
  }

  return (
    <View style={{ paddingTop: headerHeight, padding: 16, flex: 1 }}>
      <List showsVerticalScrollIndicator={false} animated contentInsetAdjustmentBehavior="always">
        <List.Section>
          <List.SectionTitle>
            <Papicons name="Code" color={colors.text + 88} />
            <Typography color="textSecondary">Liste des journaux</Typography>
          </List.SectionTitle>
          <List.Item>
            <Typography>Afficher les journaux</Typography>
            <List.Trailing>
              <Switch value={logsVisible} onValueChange={setLogsVisible}/>
            </List.Trailing>
          </List.Item>
          {logsVisible && useLogStore.getState().logs
            .slice()
            .reverse()
            .slice(0, visibleCount)
            .map((logEntry, index) => (
              <List.Item key={index}>
                <List.Leading>
                  <LogIcon type={logEntry.type} />
                </List.Leading>
                <Typography variant="body2">{logEntry.message}</Typography>
                <Typography variant="caption">
                  {new Date(logEntry.date).toLocaleString()} -{" "}
                  {logEntry.from ?? "UNKNOW"}
                </Typography>
              </List.Item>
            ))}
            {logsVisible && (
              <List.Item onPress={() => setVisibleCount(visibleCount + 5)}>
                <List.Leading>
                  <Papicons name="Plus" />
                </List.Leading>
                <Typography>Afficher plus</Typography>
              </List.Item>
            )}
        </List.Section>
        <List.Section>
          <List.SectionTitle>
            <Papicons name="Globe" color={colors.text + 88} />
            <Typography color="textSecondary">Liste des requêtes</Typography>
          </List.SectionTitle>
          {entries.map(renderHostRow)}
        </List.Section>
        <List.Section>
          <List.SectionTitle>
            <Papicons name="Bus" color={colors.text + 88} />
            <Typography color="textSecondary">Transport</Typography>
          </List.SectionTitle>
          <List.Item onPress={() => handlePress(() => {
            initializeTransport(undefined).then(transport => {
              console.log(transport);
            });
          })}>
            <Typography>Initialiser sans adresse</Typography>
          </List.Item>
          <List.Item onPress={() => handlePress(() => {
            initializeTransport("106 Rue de la Pompe, 75016 Paris").then(
              transport => {
                console.log(transport);
              }
            );
          })}>
            <Typography>Initialiser avec une adresse</Typography>
          </List.Item>
        </List.Section>
        <List.Section>
          <List.SectionTitle>
            <Papicons name="Sparkles" color={colors.text + 88} />
            <Typography color="textSecondary">Papillon Magic+</Typography>
          </List.SectionTitle>
            <List.Item onPress={() => handlePress(ClearMagicCache)}>
              <Typography>Supprimer le cache de Magic</Typography>
              <List.Trailing>
                <Typography color="textSecondary">
                  {useMagicStore.getState().processHomeworks.length} devoirs
                </Typography>
              </List.Trailing>
            </List.Item>
            <List.Item onPress={() => ModelManager.refresh}>
              <Typography>Rafraîchir le modèle</Typography>
            </List.Item>
            <List.Item onPress={() => handlePress(resetModel)}>
              <Typography>Réinitialiser le modèle</Typography>
            </List.Item>
            <List.Item onPress={() => {
              const status = ModelManager.getStatus();
              Alert.alert(
                "Statut du modèle",
                `Modèle chargé: ${status.hasModel ? "Oui" : "Non"}\n` +
                  `Max Length: ${status.maxLen}\n` +
                  `Nombre de labels: ${status.labelsCount}\n` +
                  `Taille du vocabulaire: ${status.wordIndexSize}\n` +
                  `Index OOV: ${status.oovIndex}`
              );
            }}>
              <Typography>Afficher les informations du modèle</Typography>
            </List.Item>
            <List.Item onPress={async () => {
                try {
                  const result = await ModelManager.predict(
                    "ds analyse de doc",
                    true
                  );
                  if ("error" in result) {
                    Alert.alert("Erreur de prédiction", result.error);
                  } else {
                    Alert.alert(
                      "Test de prédiction réussi",
                      `Prédiction: ${result.predicted}\nScores: ${result.scores
                        .slice(0, 3)
                        .map(s => s.toFixed(3))
                        .join(", ")}...`
                    );
                  }
                } catch (error) {
                  Alert.alert("Erreur", `Erreur lors du test: ${String(error)}`);
                }
              }}>
              <Typography>Tester les prédictions</Typography>
            </List.Item>
            <List.Item onPress={() => {
              const currentURL = useSettingsStore.getState().personalization.magicModelURL || MAGIC_URL;
  
              Alert.prompt(
                "Mise à jour de la source", undefined,
                [
                  {
                    text: "Annuler",
                    style: "cancel",
                  },
                  {
                    text: "Valider",
                    onPress: (newURL?: string) => {
                      if (newURL && newURL.trim()) {
                        useSettingsStore.getState().mutateProperty("personalization", {
                          magicModelURL: newURL.trim(),
                        });
                        Alert.alert("Succès", "URL du modèle Magic mise à jour!");
                      }
                    },
                  },
                ],
                "plain-text",
                currentURL
              );
            }}>
              <Typography>Changer la source de Magic</Typography>
            </List.Item>
            <List.Item onPress={() => handlePress(() => {
              useSettingsStore.getState().mutateProperty("personalization", {
                magicModelURL: MAGIC_URL
              })
            })}>
              <Typography>Réinitialiser la source de Magic</Typography>
            </List.Item>
        </List.Section>
        <List.Section>
          <List.SectionTitle>
            <Papicons name="AlertTriangle" color={colors.text + 88} />
            <Typography color="textSecondary">Zone de danger</Typography>
          </List.SectionTitle>
          <List.Item onPress={async () => handleDangerousAction(ClearWatermelon)}>
            <Typography variant="title">Supprimer la base de donnée</Typography>
          </List.Item>
          <List.Item onPress={() => handleDangerousAction(ClearSettings)}>
            <Typography variant="title">Supprimer les paramètres</Typography>
          </List.Item>
          <List.Item onPress={() => handleDangerousAction(ClearAccounts)}>
            <Typography variant="title">Supprimer les comptes</Typography>
          </List.Item>
          <List.Item 
            style={{ backgroundColor: "#C50017" + "30" }} 
            onPress={() => handleDangerousAction(async () => {
              await ClearWatermelon();
              await ClearSettings();
              await ClearAccounts();

              router.dismissAll();
              router.reload();
            })}
          >
            <Typography variant="title">Réinitialiser Papillon</Typography>
            <Typography variant="subtitle" color="textSecondary">Efface définitivement vos comptes, paramètres et données locales.</Typography>
          </List.Item>
        </List.Section>
      </List>
    </View>
  );
}