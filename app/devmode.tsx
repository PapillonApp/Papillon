import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Switch, View } from "react-native";
import { router } from "expo-router";
import { useHeaderHeight, useTheme } from "expo-router/react-navigation";
import { Papicons } from "@getpapillon/papicons";

import { useLogStore, useNetworkStore } from "@/stores/logs";
import List from "@/ui/new/List";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/new/Typography";
import Icon from "@/ui/components/Icon";
import SectionHeader from "@/ui/components/SectionHeader";
import Button from "@/ui/new/Button";
import { database } from "@/database";
import { ClearDatabaseForAccount } from "@/database/DatabaseProvider";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import { useSettingsStore } from "@/stores/settings";
import { useMagicStore } from "@/stores/magic";
import ModelManager from "@/utils/magic/ModelManager";
import { MAGIC_URL } from "@/utils/endpoints";
import { initializeTransport } from "@/utils/transport";
import LogIcon from "@/components/Log/LogIcon";
import { getManager, initializeAccountManager } from "@/services/shared";
import { clearSpotlightIndex, getSpotlightDebugSnapshot, reindexSpotlight, SpotlightDebugSnapshot } from "@/modules/papillon-native/src";
import {
  isSpotlightRefreshTaskRegistered,
  registerSpotlightRefreshTask,
  runSpotlightRefresh,
} from "@/utils/background/spotlightRefreshTask";
import { warn } from "@/utils/logger/logger";

const HOSTS: Record<string, { title: string; icon: string }> = {
  "index-education": { title: "PRONOTE", icon: "Pronote" },
  "ecoledirecte.com": { title: "École Directe", icon: "EcoleDirecte" },
  "api.skolengo.com": { title: "Skolengo", icon: "Skolengo" },
  "analytics.papillon.bzh": { title: "Télémétrie", icon: "PapillonIcon" },
  "github.com": { title: "Ressource(s)", icon: "Code" },
  "geopf.fr": { title: "Localisation", icon: "MapPin" },
  "raw.githubusercontent.com": { title: "GitHub", icon: "Code" }
};

export default function DevMode() {
  const theme = useTheme();
  const { colors } = theme;
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const [logsVisible, setLogsVisible] = useState<boolean>(false);
  const hosts = useNetworkStore((state) => state.hosts);
  const headerHeight = useHeaderHeight();
  const mockDataEnabled = useSettingsStore(
    state => state.personalization.mockDataEnabled ?? false
  );
  const activeAccountId = useAccountStore(state => state.lastUsedAccount);
  const accounts = useAccountStore(state => state.accounts);
  const activeAccount = accounts.find(a => a.id === activeAccountId);

  const [spotlightSnapshot, setSpotlightSnapshot] = useState<SpotlightDebugSnapshot | null>(null);
  const [spotlightTaskRegistered, setSpotlightTaskRegistered] = useState<boolean | null>(null);
  const [spotlightBusy, setSpotlightBusy] = useState(false);

  const refreshSpotlightDebugInfo = useCallback(async () => {
    const [snapshot, registered] = await Promise.all([
      getSpotlightDebugSnapshot(),
      isSpotlightRefreshTaskRegistered(),
    ]);
    setSpotlightSnapshot(snapshot);
    setSpotlightTaskRegistered(registered);
  }, []);

  useEffect(() => {
    refreshSpotlightDebugInfo();
  }, [refreshSpotlightDebugInfo]);

  const withSpotlightBusy = async (action: () => Promise<void>) => {
    if (spotlightBusy) { return; }
    setSpotlightBusy(true);
    try {
      await action();
    } catch (e) {
      Alert.alert("Erreur", String(e));
    } finally {
      await refreshSpotlightDebugInfo();
      setSpotlightBusy(false);
    }
  };

  const handleSpotlightReindex = () => withSpotlightBusy(async () => {
    if (!activeAccount) {
      Alert.alert("Erreur", "Aucun compte actif.");
      return;
    }
    await reindexSpotlight(activeAccount.services.map(service => service.id));
    Alert.alert("Succès", "Réindexation Spotlight terminée.");
  });

  const handleSpotlightClear = () => withSpotlightBusy(async () => {
    await clearSpotlightIndex();
    Alert.alert("Succès", "Index Spotlight vidé.");
  });

  const handleSpotlightFullRefresh = () => withSpotlightBusy(async () => {
    const result = await runSpotlightRefresh();
    Alert.alert(
      "Refresh terminé",
      `Sync: ${result.syncOk ? "OK" : `échec (${result.syncError})`}\n` +
        `Réindexation: ${result.reindexOk ? "OK" : `échec (${result.reindexError})`}`
    );
  });

  const handleSpotlightRegisterTask = () => withSpotlightBusy(async () => {
    await registerSpotlightRefreshTask();
  });

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

        <Typography variant="title" numberOfLines={1}>
          {classification.title}
        </Typography>
        <Typography color="textSecondary" variant="body1" numberOfLines={1}>
          {item.url.host}
        </Typography>

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

  const setMockDataEnabled = (enabled: boolean) => {
    if (enabled) {
      Alert.alert(
        "Activer Mock Data",
        "Cette option de développement rend un service scolaire fictif disponible dans l'ajout de compte.",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Activer",
            onPress: () => {
              useSettingsStore.getState().mutateProperty("personalization", {
                mockDataEnabled: true,
              });
            },
          },
        ],
      );
      return;
    }

    Alert.alert(
      "Désactiver Mock Data",
      "Les services Mock Data seront retirés de tous les comptes et leurs données locales seront supprimées.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Désactiver",
          style: "destructive",
          onPress: async () => {
            try {
              const accountStore = useAccountStore.getState();
              const mockServices = accountStore.accounts.flatMap(account =>
                account.services.filter(service => service.serviceId === Services.MOCK_DATA)
              );

              for (const service of mockServices) {
                await ClearDatabaseForAccount(service.id);
                getManager()?.removeService(service.id);
                useAccountStore.getState().removeServiceFromAccount(service.id);
              }

              useSettingsStore.getState().mutateProperty("personalization", {
                mockDataEnabled: false,
              });

              const activeAccountId = useAccountStore.getState().lastUsedAccount;
              if (activeAccountId) {
                try {
                  await initializeAccountManager(activeAccountId);
                } catch (cause) {
                  warn(`Mock Data was disabled, but the account manager could not refresh: ${String(cause)}`);
                }
              }
            } catch (cause) {
              Alert.alert("Erreur", `Impossible de désactiver Mock Data : ${String(cause)}`);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={{ paddingTop: headerHeight, padding: 16, flex: 1 }}>
      <List showsVerticalScrollIndicator={false} animated contentInsetAdjustmentBehavior="always">
        <List.Section>
          <List.SectionTitle>
            <Papicons name="Code" color={String(colors.text) + "88"} />
            <List.Label>Données de développement</List.Label>
          </List.SectionTitle>
          <List.Item>
            <Typography variant="action">Ajouter des données fictives</Typography>
            <Typography variant="body2" color="textSecondary">
              Affiche un service scolaire fictif dans l'ajout de compte.
            </Typography>
            <List.Trailing>
              <Switch value={mockDataEnabled} onValueChange={setMockDataEnabled} />
            </List.Trailing>
          </List.Item>
        </List.Section>
        <List.Section>
          <List.SectionTitle>
            <Papicons name="Code" color={colors.text + 88} />
            <List.Label>Liste des journaux</List.Label>
          </List.SectionTitle>
          <List.Item>
            <Typography variant="action">Afficher les journaux</Typography>
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
            <List.Label>Liste des requêtes</List.Label>
          </List.SectionTitle>
          {entries.map(renderHostRow)}
        </List.Section>
        <List.Section>
          <List.SectionTitle>
            <Papicons name="phone" color={colors.text + 88} />
            <List.Label>Écrans</List.Label>
          </List.SectionTitle>
          <List.Item onPress={() => router.push("/(modals)/welcome")}>
            <List.Leading>
              <Icon>
                <Papicons name="Sparkles" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Ouvrir le modal de bienvenue</Typography>
          </List.Item>
        </List.Section>
        <List.Section>
          <List.SectionTitle>
            <Papicons name="Bus" color={colors.text + 88} />
            <List.Label>Transport</List.Label>
          </List.SectionTitle>
          <List.Item onPress={() => handlePress(() => {
            initializeTransport(undefined).then(transport => {
              console.log(transport);
            });
          })}>
            <Typography variant="action">Initialiser sans adresse</Typography>
          </List.Item>
          <List.Item onPress={() => handlePress(() => {
            initializeTransport("106 Rue de la Pompe, 75016 Paris").then(
              transport => {
                console.log(transport);
              }
            );
          })}>
            <Typography variant="action">Initialiser avec une adresse</Typography>
          </List.Item>
        </List.Section>
        <List.Section>
          <List.SectionTitle>
            <Papicons name="Sparkles" color={colors.text + 88} />
            <List.Label>Papillon Magic+</List.Label>
          </List.SectionTitle>
            <List.Item onPress={() => handlePress(ClearMagicCache)}>
              <Typography variant="action">Supprimer le cache de Magic</Typography>
              <List.Trailing>
                <Typography color="textSecondary" variant="action">
                  {useMagicStore.getState().processHomeworks.length} devoirs
                </Typography>
              </List.Trailing>
            </List.Item>
            <List.Item onPress={() => ModelManager.refresh}>
              <Typography variant="action">Rafraîchir le modèle</Typography>
            </List.Item>
            <List.Item onPress={() => handlePress(resetModel)}>
              <Typography variant="action">Réinitialiser le modèle</Typography>
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
              <Typography variant="action">Afficher les informations du modèle</Typography>
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
              <Typography variant="action">Tester les prédictions</Typography>
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
              <Typography variant="action">Changer la source de Magic</Typography>
            </List.Item>
            <List.Item onPress={() => handlePress(() => {
              useSettingsStore.getState().mutateProperty("personalization", {
                magicModelURL: MAGIC_URL
              })
            })}>
              <Typography variant="action">Réinitialiser la source de Magic</Typography>
            </List.Item>
        </List.Section>
        <List.Section>
          <List.SectionTitle>
            <Papicons name="Search" color={colors.text + 88} />
            <List.Label>Siri &amp; Spotlight</List.Label>
          </List.SectionTitle>
          <List.Item>
            <Typography variant="action">Compte indexé</Typography>
            <Typography variant="body2" color="textSecondary">
              {activeAccount ? `${activeAccount.firstName} ${activeAccount.lastName} (${activeAccountId})` : "Aucun compte actif"}
            </Typography>
          </List.Item>
          <List.Item>
            <Typography variant="action">Ids de service filtrés (createdByAccount)</Typography>
            <Typography variant="body2" color="textSecondary">
              {activeAccount ? activeAccount.services.map(service => service.id).join(", ") : "—"}
            </Typography>
          </List.Item>
          <List.Item>
            <Typography variant="action">Cours</Typography>
            <List.Trailing>
              <Typography color="textSecondary" variant="action">
                {spotlightSnapshot ? `${spotlightSnapshot.indexedCourseCount} indexés / ${spotlightSnapshot.rawCourseCount} en base` : "…"}
              </Typography>
            </List.Trailing>
          </List.Item>
          <List.Item>
            <Typography variant="action">Devoirs</Typography>
            <List.Trailing>
              <Typography color="textSecondary" variant="action">
                {spotlightSnapshot ? `${spotlightSnapshot.indexedHomeworkCount} indexés / ${spotlightSnapshot.rawHomeworkCount} en base` : "…"}
              </Typography>
            </List.Trailing>
          </List.Item>
          <List.Item>
            <Typography variant="action">Notes</Typography>
            <List.Trailing>
              <Typography color="textSecondary" variant="action">
                {spotlightSnapshot ? `${spotlightSnapshot.indexedGradeCount} indexées / ${spotlightSnapshot.rawGradeCount} en base` : "…"}
              </Typography>
            </List.Trailing>
          </List.Item>
          <List.Item>
            <Typography variant="action">Dernière indexation</Typography>
            <List.Trailing>
              <Typography color="textSecondary" variant="action">
                {spotlightSnapshot?.lastIndexedAt ? new Date(spotlightSnapshot.lastIndexedAt).toLocaleString() : "Jamais"}
              </Typography>
            </List.Trailing>
          </List.Item>
          <List.Item>
            <Typography variant="action">Tâche de fond enregistrée</Typography>
            <List.Trailing>
              <Typography color="textSecondary" variant="action">
                {spotlightTaskRegistered === null ? "…" : spotlightTaskRegistered ? "Oui" : "Non"}
              </Typography>
            </List.Trailing>
          </List.Item>
          <List.Item onPress={refreshSpotlightDebugInfo}>
            <Typography variant="action">Rafraîchir les infos</Typography>
          </List.Item>
          <List.Item onPress={handleSpotlightReindex}>
            <Typography variant="action">Réindexer Spotlight maintenant</Typography>
          </List.Item>
          <List.Item onPress={handleSpotlightFullRefresh}>
            <Typography variant="action">Lancer le refresh complet (comme en tâche de fond)</Typography>
          </List.Item>
          <List.Item onPress={handleSpotlightRegisterTask}>
            <Typography variant="action">(Ré)enregistrer la tâche de fond</Typography>
          </List.Item>
          <List.Item onPress={handleSpotlightClear}>
            <List.Leading>
              <Icon>
                <Papicons name="Trash" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Vider l'index Spotlight</Typography>
          </List.Item>
        </List.Section>
        <List.Section>
          <List.SectionTitle>
            <Papicons name="AlertTriangle" color={colors.text + 88} />
            <List.Label>Zone de danger</List.Label>
          </List.SectionTitle>
          <List.Item onPress={async () => handleDangerousAction(ClearWatermelon)}>
            <List.Leading>
              <Icon>
                <Papicons name="Trash" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Supprimer la base de données</Typography>
          </List.Item>
          <List.Item onPress={() => handleDangerousAction(ClearSettings)}>
            <List.Leading>
              <Icon>
                <Papicons name="Trash" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Supprimer les paramètres</Typography>
          </List.Item>
          <List.Item onPress={() => handleDangerousAction(ClearAccounts)}>
            <List.Leading>
              <Icon>
                <Papicons name="Trash" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Supprimer les comptes</Typography>
          </List.Item>
          <List.Item 
            style={{ backgroundColor: "#C50017" }} 
            onPress={() => handleDangerousAction(async () => {
              await ClearWatermelon();
              await ClearSettings();
              await ClearAccounts();

              router.dismissAll();
              router.reload();
            })}
          >
            <List.Leading>
              <Icon fill="#FFFFFF" opacity={1}>
                <Papicons name="Trash" />
              </Icon>
            </List.Leading>
            <Typography variant="title" color="white">Réinitialiser Papillon</Typography>
            <Typography variant="subtitle" color="white">Efface définitivement vos comptes, paramètres et données locales.</Typography>
          </List.Item>
        </List.Section>
      </List>
    </View>
  );
}
