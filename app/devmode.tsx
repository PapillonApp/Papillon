import React, { useMemo, useState } from "react";
import { Alert, Platform, Switch, View } from "react-native";
import { router } from "expo-router";
import { useHeaderHeight, useTheme } from "expo-router/react-navigation";
import { Papicons } from "@getpapillon/papicons";
import * as PapillonKit from "papillonkit";
import type { CoursePreview, HomeworkPreview, JSONSchema } from "papillonkit";

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
import { useTipsStore } from "@/stores/tips";
import { showAllTips, tipsAreSupported } from "@/modules/papillon-tips";
import { useMagicStore } from "@/stores/magic";
import ModelManager from "@/utils/magic/ModelManager";
import { MAGIC_URL } from "@/utils/endpoints";
import { initializeTransport } from "@/utils/transport";
import LogIcon from "@/components/Log/LogIcon";
import { attachMockDataToCurrentAccount } from "@/services/mock/account";
import { getManager, initializeAccountManager } from "@/services/shared";
import { fillStoreFromServices } from "@/utils/devmode/fillStore";
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

const INTELLIGENCE_LABELS: Record<string, string> = {
  available: "Disponible",
  deviceNotEligible: "Appareil non compatible",
  appleIntelligenceNotEnabled: "Désactivé dans Réglages",
  modelNotReady: "Modèle en téléchargement",
  unknown: "Inconnu",
  unsupported: "Non supporté",
};

const SAMPLE_SCHEMA: JSONSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "Titre court de la tâche" },
    priority: { type: "string", enum: ["basse", "moyenne", "haute"] },
    steps: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
    minutes: { type: "integer", minimum: 5, maximum: 180 },
  },
  required: ["title", "priority", "steps", "minutes"],
};

const formatDate = (value: number) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatCourse = (course: CoursePreview) =>
  [
    `${course.emoji} ${course.title}${course.isCanceled ? " (annulé)" : ""}`,
    `  ${formatDate(course.from)}`,
    course.room ? `  Salle ${course.room}` : null,
    course.teacher ? `  ${course.teacher}` : null,
  ]
    .filter(Boolean)
    .join("\n");

const formatHomework = (homework: HomeworkPreview) =>
  [
    `${homework.emoji} ${homework.title}${homework.isDone ? " (terminé)" : ""}`,
    `  pour le ${formatDate(homework.dueDate)}`,
    homework.content ? `  ${homework.content.slice(0, 80)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

const yesNo = (value: boolean | undefined) => (value ? "Oui" : "Non");

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

  const runPapillonKit = async (task: () => Promise<void>) => {
    try {
      await task();
    } catch (error) {
      const code = (error as { code?: string }).code;
      Alert.alert("Erreur", `${code ? `${code}\n\n` : ""}${String((error as Error).message ?? error)}`);
    }
  };

  const loadSnapshot = async () => {
    const snapshot = await PapillonKit.getDebugSnapshot();
    if (!snapshot) {
      throw new Error("PapillonKit n'est pas lié à cette build (iOS 27 requis).");
    }
    return snapshot;
  };

  function AttachMockData() {
    const { accounts, lastUsedAccount } = useAccountStore.getState();
    const account = accounts.find(item => item.id === lastUsedAccount);

    if (!account) {
      Alert.alert("Aucun compte actif", "Crée d'abord un compte, puis reviens attacher Mock Data.");
      return;
    }
    if (account.services.some(service => service.serviceId === Services.MOCK_DATA)) {
      Alert.alert("Déjà attaché", "Mock Data est déjà sur ce compte. Utilise « Remplir la base ».");
      return;
    }

    Alert.alert("Attacher Mock Data", `Ajoute le service fictif à « ${account.firstName} ${account.lastName} ».`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Attacher",
        onPress: () => {
          attachMockDataToCurrentAccount().catch(cause =>
            Alert.alert("Erreur", `Impossible d'attacher Mock Data : ${String(cause)}`)
          );
        },
      },
    ]);
  }

  async function FillStore() {
    const report = await fillStoreFromServices();
    Alert.alert(
      report.failures.length > 0 ? "Remplissage incomplet" : "Base remplie",
      [
        report.account ? `Compte : ${report.account.name} — ${report.account.serviceCount} service(s)` : null,
        report.lines.join("\n") || null,
        report.skipped.length ? `Non exposé par le service :\n${report.skipped.join(", ")}` : null,
        report.failures.length ? `Échecs :\n${report.failures.join("\n")}` : null,
      ]
        .filter(Boolean)
        .join("\n\n") || "Rien à récupérer."
    );
  }

  const ShowPapillonKitState = () =>
    runPapillonKit(async () => {
      const snapshot = await loadSnapshot();
      const refresh = snapshot.lastRefresh;
      const accounts = (snapshot.accounts ?? [])
        .map(account => `${account.isCurrent ? "▸ " : ""}${account.name} (${account.serviceCount})`)
        .join(", ");

      Alert.alert(
        "État PapillonKit",
        [
          `iOS ${snapshot.osVersion}`,
          `App Group stockage : ${snapshot.appGroups.storage.identifier} (${yesNo(snapshot.appGroups.storage.reachable)})`,
          `App Group base : ${snapshot.appGroups.database.identifier} (${yesNo(snapshot.appGroups.database.reachable)})`,
          `Base présente : ${yesNo(snapshot.database.exists)}`,
          snapshot.database.error
            ? `Lecture base : ${snapshot.database.error}`
            : `Cours : ${snapshot.database.courseCount} · Devoirs : ${snapshot.database.homeworkCount}`,
          snapshot.accountsError ? `Comptes : ${snapshot.accountsError}` : `Comptes : ${accounts || "aucun"}`,
          `Apple Intelligence : ${INTELLIGENCE_LABELS[snapshot.intelligence.status] ?? snapshot.intelligence.status}`,
          `Snapshot widgets : ${snapshot.widgets.snapshotDate ? formatDate(snapshot.widgets.snapshotDate) : "jamais écrit"}`,
          ...(["Calendar", "Tasks"] as const).map(kind => {
            const entry = snapshot.widgets.diagnostics[kind];
            if (!entry) return `Widget ${kind} : jamais affiché`;
            return `Widget ${kind} : ${formatDate(entry.date)}, ${entry.itemCount} élément(s)${entry.accountId ? "" : ", aucun compte"}${entry.error ? `, ${entry.error}` : ""}`;
          }),
          refresh
            ? `Dernier rafraîchissement : ${formatDate(refresh.date)}${refresh.errors.length ? `\n${refresh.errors.join("\n")}` : ""}`
            : "Pas encore rafraîchi",
        ].join("\n")
      );
    });

  const ShowSiriAnswers = () =>
    runPapillonKit(async () => {
      const snapshot = await loadSnapshot();
      Alert.alert(
        "Réponses de Siri",
        [
          "Prochain cours :",
          snapshot.nextCourse ? formatCourse(snapshot.nextCourse) : "  aucun",
          "",
          "Prochain devoir :",
          snapshot.nextHomework ? formatHomework(snapshot.nextHomework) : "  aucun",
        ].join("\n")
      );
    });

  const ShowIndexableContent = () =>
    runPapillonKit(async () => {
      const snapshot = await loadSnapshot();
      const courses = snapshot.upcomingCourses ?? [];
      const homework = snapshot.upcomingHomework ?? [];
      Alert.alert(
        `${courses.length} cours · ${homework.length} devoir(s) cette semaine`,
        [...courses.map(formatCourse), ...homework.map(formatHomework)].join("\n\n") || "Rien à afficher."
      );
    });

  const RefreshPapillonKit = () =>
    runPapillonKit(async () => {
      const report = await PapillonKit.refresh();
      if (!report) {
        throw new Error("PapillonKit n'est pas disponible.");
      }
      Alert.alert(
        "Rafraîchissement terminé",
        [
          report.index
            ? `${report.index.indexedCourses} cours et ${report.index.indexedHomework} devoir(s) indexés, ${report.index.removed} retiré(s).`
            : "Index non mis à jour.",
          ...report.errors,
        ]
          .filter(Boolean)
          .join("\n\n")
      );
    });

  const TestGenerateObject = () =>
    runPapillonKit(async () => {
      const result = await PapillonKit.intelligence.generateObject(
        "Je dois réviser le chapitre 4 de physique sur l'électricité pour un contrôle vendredi.",
        { instructions: "Tu aides un élève à organiser son travail.", schema: SAMPLE_SCHEMA }
      );
      Alert.alert("generateObject()", JSON.stringify(result, null, 2));
    });

  function ReloadWidgets() {
    PapillonKit.widgets.reload();
    Alert.alert("Widgets rechargés", "WidgetKit relit la base et redessine Emploi du temps et Tâches.");
  }

  const ClearSiriIndex = () =>
    runPapillonKit(async () => {
      await PapillonKit.clearIndex();
      Alert.alert("Index vidé", "Plus aucun cours ni devoir dans Spotlight et Siri.");
    });

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

  const forceAllTips = useTipsStore(state => state.forceAll);

  const triggerAllTips = async () => {
    useTipsStore.getState().setForceAll(true);
    await showAllTips();
    Alert.alert(
      "Astuces forcées",
      "Chaque astuce réapparaîtra sur son écran sans attendre le nombre d'ouvertures habituel, et sans consommer ses passages."
    );
  };

  // Only lifts our own override. TipKit's `showAllTipsForTesting` has no
  // counterpart that simply cancels it — `hideAllTipsForTesting` force-hides
  // everything instead — so the override itself dies with the process, and is
  // just not re-applied at the next launch.
  const stopForcingTips = () => {
    useTipsStore.getState().setForceAll(false);
    Alert.alert(
      "Astuces",
      "Les astuces reprennent leur rythme normal. Celles déjà à l'écran le resteront jusqu'au prochain lancement."
    );
  };

  const resetAllTips = () => {
    Alert.alert(
      "Réinitialiser les astuces",
      "Les compteurs d'ouverture et d'affichage repartent de zéro. TipKit n'accepte d'oublier les astuces déjà fermées qu'au démarrage, alors elles reviendront au prochain lancement de l'app.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Réinitialiser",
          style: "destructive",
          onPress: () => {
            const tips = useTipsStore.getState();
            tips.reset();
            tips.requestDatastoreReset();
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.overground }}>
      <List showsVerticalScrollIndicator={false} animated contentInsetAdjustmentBehavior="always" contentContainerStyle={{ padding: 16 }}>
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
            <Papicons name="ArrowDownBox" color={String(colors.text) + "88"} />
            <List.Label>Remplissage des données</List.Label>
          </List.SectionTitle>
          <List.Item onPress={AttachMockData}>
            <List.Leading>
              <Icon>
                <Papicons name="Plus" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Attacher Mock Data au compte actif</Typography>
            <Typography variant="body2" color="textSecondary">
              Donne un service fictif au compte actif.
            </Typography>
          </List.Item>
          <List.Item onPress={FillStore}>
            <List.Leading>
              <Icon>
                <Papicons name="ArrowDownBox" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Remplir la base</Typography>
            <Typography variant="body2" color="textSecondary">
              Récupère toutes les données du compte actif d'un coup.
            </Typography>
          </List.Item>
        </List.Section>
        {Platform.OS === "ios" && (
          <List.Section>
            <List.SectionTitle>
              <Papicons name="Sparkles" color={String(colors.text) + "88"} />
              <List.Label>PapillonKit</List.Label>
            </List.SectionTitle>
            <List.Item>
              <Typography variant="action">Apple Intelligence</Typography>
              <Typography variant="body2" color="textSecondary">
                {PapillonKit.isSupported ? "iPhone 15 Pro ou plus récent requis." : "Module natif absent de cette build."}
              </Typography>
              <List.Trailing>
                <Typography color="textSecondary" variant="action">
                  {INTELLIGENCE_LABELS[PapillonKit.intelligence.getAvailability().status]}
                </Typography>
              </List.Trailing>
            </List.Item>
            <List.Item onPress={ShowPapillonKitState}>
              <List.Leading>
                <Icon>
                  <Papicons name="Info" />
                </Icon>
              </List.Leading>
              <Typography variant="action">État</Typography>
              <Typography variant="body2" color="textSecondary">
                App Groups, base partagée, comptes et dernier rafraîchissement.
              </Typography>
            </List.Item>
            <List.Item onPress={ShowSiriAnswers}>
              <List.Leading>
                <Icon>
                  <Papicons name="Search" />
                </Icon>
              </List.Leading>
              <Typography variant="action">Réponses de Siri</Typography>
              <Typography variant="body2" color="textSecondary">
                Ce que Siri répond à « prochain cours » et « prochain devoir ».
              </Typography>
            </List.Item>
            <List.Item onPress={ShowIndexableContent}>
              <List.Leading>
                <Icon>
                  <Papicons name="Calendar" />
                </Icon>
              </List.Leading>
              <Typography variant="action">Contenu indexable</Typography>
              <Typography variant="body2" color="textSecondary">
                Cours et devoirs des 7 prochains jours.
              </Typography>
            </List.Item>
            <List.Item onPress={RefreshPapillonKit}>
              <List.Leading>
                <Icon>
                  <Papicons name="ArrowDownBox" />
                </Icon>
              </List.Leading>
              <Typography variant="action">Rafraîchir maintenant</Typography>
              <Typography variant="body2" color="textSecondary">
                Réindexe Spotlight et recharge les widgets.
              </Typography>
            </List.Item>
            <List.Item onPress={ReloadWidgets}>
              <List.Leading>
                <Icon>
                  <Papicons name="Grid" />
                </Icon>
              </List.Leading>
              <Typography variant="action">Recharger les widgets</Typography>
              <Typography variant="body2" color="textSecondary">
                Relit la base et redessine les widgets de l'écran d'accueil.
              </Typography>
            </List.Item>
            <List.Item onPress={TestGenerateObject}>
              <List.Leading>
                <Icon>
                  <Papicons name="Code" />
                </Icon>
              </List.Leading>
              <Typography variant="action">Tester generateObject()</Typography>
              <Typography variant="body2" color="textSecondary">
                Génère un JSON conforme à un schéma d'exemple.
              </Typography>
            </List.Item>
            <List.Item onPress={ClearSiriIndex}>
              <List.Leading>
                <Icon>
                  <Papicons name="Trash" />
                </Icon>
              </List.Leading>
              <Typography variant="action">Vider l'index Siri</Typography>
              <Typography variant="body2" color="textSecondary">
                Retire tous les cours et devoirs de Spotlight.
              </Typography>
            </List.Item>
          </List.Section>
        )}
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
        {tipsAreSupported && (
          <List.Section>
            <List.SectionTitle>
              <Papicons name="Sparkles" color={String(colors.text) + "88"} />
              <List.Label>Astuces</List.Label>
            </List.SectionTitle>
            <List.Item onPress={() => (forceAllTips ? stopForcingTips() : triggerAllTips())}>
              <List.Leading>
                <Icon>
                  <Papicons name="Sparkles" />
                </Icon>
              </List.Leading>
              <Typography variant="action">
                {forceAllTips ? "Ne plus forcer les astuces" : "Forcer toutes les astuces"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Affiche chaque astuce dès le prochain passage sur son écran, sans
                attendre le nombre d'ouvertures habituel.
              </Typography>
            </List.Item>
            <List.Item onPress={resetAllTips}>
              <List.Leading>
                <Icon>
                  <Papicons name="Trash" />
                </Icon>
              </List.Leading>
              <Typography variant="action">Réinitialiser toutes les astuces</Typography>
              <Typography variant="body2" color="textSecondary">
                Remet les compteurs à zéro. Les astuces déjà fermées reviennent au
                prochain lancement.
              </Typography>
            </List.Item>
          </List.Section>
        )}
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
