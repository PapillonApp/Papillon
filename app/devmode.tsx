import React from "react";
import { ActivityIndicator, Alert, Platform, Switch, View } from "react-native";
import { router } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import { Papicons } from "@getpapillon/papicons";
import * as PapillonKit from "@getpapillon/papillonkit";

import packageJson from "@/package.json";
import Disclosure from "@/components/Devmode/Disclosure";
import { database } from "@/database";
import { ClearDatabaseForAccount } from "@/database/DatabaseProvider";
import { showAllTips, tipsAreSupported } from "@/modules/papillon-tips";
import { attachMockDataToCurrentAccount } from "@/services/mock/account";
import { getManager, initializeAccountManager } from "@/services/shared";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import { useLogStore, useNetworkStore } from "@/stores/logs";
import { LogType } from "@/stores/logs/types";
import { useMagicStore } from "@/stores/magic";
import { useSettingsStore } from "@/stores/settings";
import { useTipsStore } from "@/stores/tips";
import Icon from "@/ui/components/Icon";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { confirmDestructive, useDevAction } from "@/utils/devmode/actions";
import { fillStoreFromServices } from "@/utils/devmode/fillStore";
import { warn } from "@/utils/logger/logger";
import { initializeTransport } from "@/utils/transport";

const SCHOOL_ADDRESS = "106 Rue de la Pompe, 75016 Paris";

const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? "s" : ""}`;

export default function DevMode() {
  const { colors } = useTheme();
  const muted = String(colors.text) + "88";
  const { running, run } = useDevAction();

  const mockDataEnabled = useSettingsStore(state => state.personalization.mockDataEnabled ?? false);
  const account = useAccountStore(state => state.accounts.find(item => item.id === state.lastUsedAccount));
  const logCount = useLogStore(state => state.logs.length);
  const errorCount = useLogStore(state => state.logs.filter(log => log.type === LogType.ERROR).length);
  const requestCount = useNetworkStore(state =>
    Array.from(state.hosts.values()).reduce((total, host) => total + host.requests.length, 0)
  );
  const hostCount = useNetworkStore(state => state.hosts.size);
  const magicCount = useMagicStore(state => state.processHomeworks.length);
  const forceAllTips = useTipsStore(state => state.forceAll);

  const attachMockData = () => {
    if (!account) {
      Alert.alert("Aucun compte actif", "Crée d'abord un compte, puis reviens attacher Mock Data.");
      return;
    }
    if (account.services.some(service => service.serviceId === Services.MOCK_DATA)) {
      Alert.alert("Mock Data déjà attaché", "Utilise « Remplir la base » pour récupérer ses données.");
      return;
    }
    Alert.alert("Attacher Mock Data", `Ajoute le service fictif à ${account.firstName} ${account.lastName}.`, [
      { text: "Annuler", style: "cancel" },
      { text: "Attacher", onPress: () => run("attach", attachMockDataToCurrentAccount) },
    ]);
  };

  const fillStore = () =>
    run("fill", async () => {
      const report = await fillStoreFromServices();
      Alert.alert(
        report.failures.length > 0 ? "Remplissage incomplet" : "Base remplie",
        [
          report.account ? `${report.account.name} · ${plural(report.account.serviceCount, "service")}` : null,
          report.lines.join("\n") || null,
          report.skipped.length ? `Non fourni par le service :\n${report.skipped.join(", ")}` : null,
          report.failures.length ? `Échecs :\n${report.failures.join("\n")}` : null,
        ]
          .filter(Boolean)
          .join("\n\n") || "Rien à récupérer."
      );
    });

  const disableMockData = async () => {
    const mockServices = useAccountStore
      .getState()
      .accounts.flatMap(item => item.services.filter(service => service.serviceId === Services.MOCK_DATA));

    for (const service of mockServices) {
      await ClearDatabaseForAccount(service.id);
      getManager()?.removeService(service.id);
      useAccountStore.getState().removeServiceFromAccount(service.id);
    }

    useSettingsStore.getState().mutateProperty("personalization", { mockDataEnabled: false });

    const activeAccountId = useAccountStore.getState().lastUsedAccount;
    if (activeAccountId) {
      try {
        await initializeAccountManager(activeAccountId);
      } catch (cause) {
        warn(`Mock Data was disabled, but the account manager could not refresh: ${String(cause)}`);
      }
    }
  };

  const setMockDataEnabled = (enabled: boolean) => {
    if (enabled) {
      useSettingsStore.getState().mutateProperty("personalization", { mockDataEnabled: true });
      return;
    }
    confirmDestructive(
      "Désactiver Mock Data",
      "Les services Mock Data seront retirés de tous les comptes et leurs données locales supprimées.",
      "Désactiver",
      disableMockData
    );
  };

  const toggleForcedTips = async () => {
    if (forceAllTips) {
      useTipsStore.getState().setForceAll(false);
      return;
    }
    useTipsStore.getState().setForceAll(true);
    await showAllTips();
  };

  const resetTips = () =>
    confirmDestructive(
      "Réinitialiser les astuces",
      "Les compteurs repartent de zéro. Les astuces déjà fermées reviendront au prochain lancement de l'app.",
      "Réinitialiser",
      () => {
        const tips = useTipsStore.getState();
        tips.reset();
        tips.requestDatastoreReset();
      }
    );

  const testTransport = (address?: string) =>
    run(address ? "transport-address" : "transport", async () => {
      const transport = await initializeTransport(address);
      Alert.alert("Transport initialisé", JSON.stringify(transport, null, 2));
    });

  const clearDatabase = () =>
    database.write(async () => {
      await database.unsafeResetDatabase();
    });

  const resetPapillon = async () => {
    await clearDatabase();
    useSettingsStore.getState().reset();
    useAccountStore.getState().reset();
    router.dismissAll();
    router.reload();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.overground }}>
      <List
        showsVerticalScrollIndicator={false}
        animated
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        <List.Section>
          <List.SectionTitle>
            <Papicons name="Info" color={muted} />
            <List.Label>Cette installation</List.Label>
          </List.SectionTitle>
          <List.Item>
            <Typography variant="action">Papillon</Typography>
            <List.Trailing>
              <Typography variant="body1" color="textSecondary">
                {packageJson.version}
              </Typography>
            </List.Trailing>
          </List.Item>
          <List.Item>
            <Typography variant="action">Système</Typography>
            <List.Trailing>
              <Typography variant="body1" color="textSecondary">
                {`${Platform.OS === "ios" ? "iOS" : "Android"} ${Platform.Version}`}
              </Typography>
            </List.Trailing>
          </List.Item>
          <List.Item>
            <Typography variant="action">Compte actif</Typography>
            <Typography variant="body2" color="textSecondary" numberOfLines={1}>
              {account
                ? `${account.firstName} ${account.lastName} · ${plural(account.services.length, "service")}`
                : "Aucun"}
            </Typography>
          </List.Item>
        </List.Section>

        <List.Section>
          <List.SectionTitle>
            <Papicons name="ArrowDownBox" color={muted} />
            <List.Label>Données</List.Label>
          </List.SectionTitle>
          <List.Item>
            <Typography variant="action">Service fictif</Typography>
            <Typography variant="body2" color="textSecondary">
              Propose Mock Data dans l'ajout de compte.
            </Typography>
            <List.Trailing>
              <Switch value={mockDataEnabled} onValueChange={setMockDataEnabled} />
            </List.Trailing>
          </List.Item>
          <List.Item onPress={attachMockData}>
            <List.Leading>
              <Icon>
                <Papicons name="Plus" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Attacher Mock Data au compte actif</Typography>
            {running === "attach" ? (
              <List.Trailing>
                <ActivityIndicator />
              </List.Trailing>
            ) : null}
          </List.Item>
          <List.Item onPress={fillStore}>
            <List.Leading>
              <Icon>
                <Papicons name="ArrowDownBox" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Remplir la base</Typography>
            <Typography variant="body2" color="textSecondary">
              Récupère d'un coup toutes les données du compte actif.
            </Typography>
            {running === "fill" ? (
              <List.Trailing>
                <ActivityIndicator />
              </List.Trailing>
            ) : null}
          </List.Item>
        </List.Section>

        <List.Section>
          <List.SectionTitle>
            <Papicons name="Code" color={muted} />
            <List.Label>Diagnostic</List.Label>
          </List.SectionTitle>
          <List.Item href="/(dev)/logs">
            <List.Leading>
              <Icon>
                <Papicons name="List" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Journaux</Typography>
            <Typography variant="body2" color="textSecondary">
              {errorCount > 0 ? plural(errorCount, "erreur") : "Aucune erreur"}
            </Typography>
            <List.Trailing>
              <Disclosure value={logCount} />
            </List.Trailing>
          </List.Item>
          <List.Item href="/(dev)/network">
            <List.Leading>
              <Icon>
                <Papicons name="Globe" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Requêtes réseau</Typography>
            <Typography variant="body2" color="textSecondary">
              {hostCount > 0 ? plural(hostCount, "serveur") : "Aucune requête"}
            </Typography>
            <List.Trailing>
              <Disclosure value={requestCount} />
            </List.Trailing>
          </List.Item>
        </List.Section>

        <List.Section>
          <List.SectionTitle>
            <Papicons name="Sparkles" color={muted} />
            <List.Label>Modules</List.Label>
          </List.SectionTitle>
          {Platform.OS === "ios" && PapillonKit.isSupported ? (
            <List.Item href="/(dev)/papillonkit">
              <List.Leading>
                <Icon>
                  <Papicons name="Apple" />
                </Icon>
              </List.Leading>
              <Typography variant="action">PapillonKit</Typography>
              <Typography variant="body2" color="textSecondary">
                Siri, widgets et Apple Intelligence
              </Typography>
              <List.Trailing>
                <Disclosure />
              </List.Trailing>
            </List.Item>
          ) : null}
          <List.Item href="/(dev)/magic">
            <List.Leading>
              <Icon>
                <Papicons name="Sparkles" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Papillon Magic+</Typography>
            <Typography variant="body2" color="textSecondary">
              Modèle de classement des devoirs
            </Typography>
            <List.Trailing>
              <Disclosure value={magicCount > 0 ? plural(magicCount, "devoir") : undefined} />
            </List.Trailing>
          </List.Item>
        </List.Section>

        {tipsAreSupported ? (
          <List.Section>
            <List.SectionTitle>
              <Papicons name="InfoBox" color={muted} />
              <List.Label>Astuces</List.Label>
            </List.SectionTitle>
            <List.Item>
              <Typography variant="action">Forcer toutes les astuces</Typography>
              <Typography variant="body2" color="textSecondary">
                Chaque astuce apparaît dès le prochain passage sur son écran.
              </Typography>
              <List.Trailing>
                <Switch value={forceAllTips} onValueChange={() => run("tips", toggleForcedTips)} />
              </List.Trailing>
            </List.Item>
            <List.Item onPress={resetTips}>
              <List.Leading>
                <Icon>
                  <Papicons name="Trash" />
                </Icon>
              </List.Leading>
              <Typography variant="action">Réinitialiser les astuces</Typography>
            </List.Item>
          </List.Section>
        ) : null}

        <List.Section>
          <List.SectionTitle>
            <Papicons name="Bus" color={muted} />
            <List.Label>Transport</List.Label>
          </List.SectionTitle>
          <List.Item onPress={() => testTransport()}>
            <List.Leading>
              <Icon>
                <Papicons name="Play" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Initialiser sans adresse</Typography>
            {running === "transport" ? (
              <List.Trailing>
                <ActivityIndicator />
              </List.Trailing>
            ) : null}
          </List.Item>
          <List.Item onPress={() => testTransport(SCHOOL_ADDRESS)}>
            <List.Leading>
              <Icon>
                <Papicons name="MapPin" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Initialiser avec une adresse</Typography>
            <Typography variant="body2" color="textSecondary">
              {SCHOOL_ADDRESS}
            </Typography>
            {running === "transport-address" ? (
              <List.Trailing>
                <ActivityIndicator />
              </List.Trailing>
            ) : null}
          </List.Item>
        </List.Section>

        <List.Section>
          <List.SectionTitle>
            <Papicons name="Phone" color={muted} />
            <List.Label>Écrans</List.Label>
          </List.SectionTitle>
          <List.Item href="/(modals)/welcome">
            <List.Leading>
              <Icon>
                <Papicons name="Butterfly" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Modal de bienvenue</Typography>
            <List.Trailing>
              <Disclosure />
            </List.Trailing>
          </List.Item>
        </List.Section>

        <List.Section>
          <List.SectionTitle>
            <Papicons name="AlertTriangle" color={muted} />
            <List.Label>Zone de danger</List.Label>
          </List.SectionTitle>
          <List.Item
            onPress={() =>
              confirmDestructive(
                "Supprimer la base de données",
                "Toutes les données enregistrées sur cet appareil seront effacées. Celles des services reviendront à la prochaine synchronisation, pas celles ajoutées à la main.",
                "Supprimer",
                async () => {
                  await clearDatabase();
                  Alert.alert("Base de données supprimée");
                }
              )
            }
          >
            <List.Leading>
              <Icon>
                <Papicons name="Trash" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Supprimer la base de données</Typography>
          </List.Item>
          <List.Item
            onPress={() =>
              confirmDestructive(
                "Réinitialiser les paramètres",
                "Tous les réglages de Papillon reviennent à leur valeur par défaut.",
                "Réinitialiser",
                () => {
                  useSettingsStore.getState().reset();
                  Alert.alert("Paramètres réinitialisés");
                }
              )
            }
          >
            <List.Leading>
              <Icon>
                <Papicons name="Gears" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Réinitialiser les paramètres</Typography>
          </List.Item>
          <List.Item
            onPress={() =>
              confirmDestructive(
                "Supprimer les comptes",
                "Tous les comptes seront déconnectés de cet appareil.",
                "Supprimer",
                () => {
                  useAccountStore.getState().reset();
                  Alert.alert("Comptes supprimés");
                }
              )
            }
          >
            <List.Leading>
              <Icon>
                <Papicons name="UserCross" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Supprimer les comptes</Typography>
          </List.Item>
          <List.Item
            style={{ backgroundColor: "#C50017" }}
            onPress={() =>
              confirmDestructive(
                "Réinitialiser Papillon",
                "Comptes, paramètres et données locales seront définitivement effacés, puis l'app redémarrera.",
                "Tout effacer",
                resetPapillon
              )
            }
          >
            <List.Leading>
              <Icon fill="#FFFFFF" opacity={1}>
                <Papicons name="Trash" />
              </Icon>
            </List.Leading>
            <Typography variant="title" color="white">
              Réinitialiser Papillon
            </Typography>
            <Typography variant="body2" color="white">
              Efface comptes, paramètres et données locales.
            </Typography>
          </List.Item>
        </List.Section>
      </List>
    </View>
  );
}
