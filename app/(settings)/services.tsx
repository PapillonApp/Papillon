import { UserX2Icon, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react-native";
import React, { useState, useCallback } from "react";
import { ScrollView, Alert, ActivityIndicator, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Icon from "@/ui/components/Icon";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import Avatar from "@/ui/components/Avatar";
import { getInitials } from "@/utils/chats/initials";
import adjust from "@/utils/adjustColor";
import { diagnoseAccount, ServiceDiagnostic } from "@/utils/account/diagnostics";
import { Papicons } from "@getpapillon/papicons";

const SERVICE_NAMES: Record<Services, string> = {
  [Services.PRONOTE]: "PRONOTE",
  [Services.SKOLENGO]: "Skolengo",
  [Services.ECOLEDIRECTE]: "EcoleDirecte",
  [Services.TURBOSELF]: "TurboSelf",
  [Services.ARD]: "ARD",
  [Services.IZLY]: "Izly",
  [Services.MULTI]: "Multi",
  [Services.ALISE]: "Alise",
  [Services.APPSCHO]: "AppScho",
};

const SERVICE_ICONS: Record<Services, string> = {
  [Services.PRONOTE]: "Book",
  [Services.SKOLENGO]: "GraduationCap",
  [Services.ECOLEDIRECTE]: "School",
  [Services.TURBOSELF]: "Utensils",
  [Services.ARD]: "Sandwich",
  [Services.IZLY]: "Wallet",
  [Services.MULTI]: "Users",
  [Services.ALISE]: "Coffee",
  [Services.APPSCHO]: "Backpack",
};

export default function SettingsServices() {
  const accountStore = useAccountStore();
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;
  const router = useRouter();

  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [diagnosticResults, setDiagnosticResults] = useState<Map<string, ServiceDiagnostic[]>>(new Map());
  const [loadingAccounts, setLoadingAccounts] = useState<Set<string>>(new Set());

  const toggleAccount = useCallback((accountId: string) => {
    setExpandedAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
        // Lancer le diagnostic si pas déjà fait
        if (!diagnosticResults.has(accountId)) {
          const account = accountStore.accounts.find(a => a.id === accountId);
          if (account) {
            runDiagnostic(accountId, account);
          }
        }
      }
      return newSet;
    });
  }, [diagnosticResults, accountStore.accounts]);

  const runDiagnostic = useCallback(async (accountId: string, account: any) => {
    setLoadingAccounts(prev => new Set(prev).add(accountId));

    try {
      const result = await diagnoseAccount(account);
      setDiagnosticResults(prev => {
        const newMap = new Map(prev);
        newMap.set(accountId, result.serviceDetails);
        return newMap;
      });
    } catch (error) {
      Alert.alert(
        "Erreur",
        `Impossible d'effectuer le diagnostic: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoadingAccounts(prev => {
        const newSet = new Set(prev);
        newSet.delete(accountId);
        return newSet;
      });
    }
  }, []);

  const refreshDiagnostic = useCallback((accountId: string) => {
    const account = accountStore.accounts.find(a => a.id === accountId);
    if (account) {
      runDiagnostic(accountId, account);
    }
  }, [accountStore.accounts, runDiagnostic]);

  const reconnectService = useCallback((serviceId: Services, accountId: string, serviceAccountId: string, errorMessage?: string) => {
    const serviceName = SERVICE_NAMES[serviceId];

    router.push({
      pathname: "/(modals)/reconnect-service",
      params: {
        serviceName,
        serviceId: serviceId.toString(),
        serviceAccountId: serviceAccountId,
        errorMessage: errorMessage || "Impossible de renouveler le service",
      },
    });
  }, [router]);

  const getServiceHealthColor = useCallback((isWorking: boolean) => {
    return isWorking ? "#4CAF50" : "#F44336";
  }, []);

  // Fonction pour rendre les items d'un compte
  const renderAccountItems = (account: any) => {
    const isExpanded = expandedAccounts.has(account.id);
    const isLoading = loadingAccounts.has(account.id);
    const serviceDiagnostics = diagnosticResults.get(account.id);
    const isCurrentAccount = account.id === accountStore.lastUsedAccount;

    const items = [];

    // En-tête du compte
    items.push(
      <Item key={`account-${account.id}`} onPress={() => toggleAccount(account.id)}>
        <Leading>
          <Avatar
            size={48}
            initials={getInitials(`${account.firstName} ${account.lastName}`)}
            imageUrl={account.customisation?.profilePicture ? `data:image/png;base64,${account.customisation.profilePicture}` : undefined}
          />
        </Leading>
        <Typography variant="title">
          {account.firstName} {account.lastName}
        </Typography>
        {account.schoolName && (
          <Typography variant="caption" color="secondary">
            {account.schoolName}
          </Typography>
        )}
        <Trailing>
          <Icon>
            <Papicons name={isExpanded ? "ChevronUp" : "ChevronDown"} />
          </Icon>
        </Trailing>
      </Item>
    );

    // Services du compte (si développé)
    if (isExpanded) {
      if (isLoading) {
        items.push(
          <Item key={`loading-${account.id}`}>
            <Leading>
              <ActivityIndicator color={colors.primary} />
            </Leading>
            <Typography variant="body2" color="secondary">
              Vérification des services...
            </Typography>
          </Item>
        );
      } else if (serviceDiagnostics) {
        // Bouton actualiser
        items.push(
          <Item key={`refresh-${account.id}`} onPress={() => refreshDiagnostic(account.id)}>
            <Leading>
              <Icon>
                <RefreshCw size={24} />
              </Icon>
            </Leading>
            <Typography variant="title">Actualiser</Typography>
            <Typography variant="caption" color="secondary">
              Vérifier à nouveau
            </Typography>
          </Item>
        );

        // Services diagnostiqués
        serviceDiagnostics.forEach((diagnostic, index) => {
          const healthColor = getServiceHealthColor(diagnostic.isWorking);
          const iconName = SERVICE_ICONS[diagnostic.serviceId] || "Star";

          // Trouver le serviceAccount correspondant
          const serviceAccount = account.services.find((s: any) => s.serviceId === diagnostic.serviceId);
          const serviceAccountId = serviceAccount?.id || "";

          items.push(
            <Item
              key={`service-${account.id}-${diagnostic.serviceId}-${index}`}
              onPress={() => {
                if (!diagnostic.isWorking) {
                  reconnectService(diagnostic.serviceId, account.id, serviceAccountId, diagnostic.errorMessage);
                }
              }}
            >
              <Leading>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: adjust(healthColor, theme.dark ? -0.8 : 0.8),
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Icon papicon fill={healthColor}>
                    <Papicons name={iconName} />
                  </Icon>
                </View>
              </Leading>
              <Typography variant="title">
                {diagnostic.serviceName}
              </Typography>
              <Typography variant="caption" color="secondary">
                {diagnostic.isWorking
                  ? diagnostic.responseTime
                    ? `Opérationnel • ${Math.round(diagnostic.responseTime / 1000)}s`
                    : "Opérationnel"
                  : diagnostic.errorMessage || "Erreur de connexion"}
              </Typography>
              <Trailing>
                {diagnostic.isWorking ? (
                  <CheckCircle size={20} color={healthColor} strokeWidth={2.5} />
                ) : (
                  <AlertTriangle size={20} color={healthColor} strokeWidth={2.5} />
                )}
              </Trailing>
            </Item>
          );
        });
      } else {
        // Services non diagnostiqués
        account.services.forEach((service: { id: string; serviceId: Services }, index: number) => {
          items.push(
            <Item key={`service-pending-${account.id}-${service.id}-${index}`}>
              <Leading>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.border,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Icon papicon fill={colors.text}>
                    <Papicons name={SERVICE_ICONS[service.serviceId] || "Star"} />
                  </Icon>
                </View>
              </Leading>
              <Typography variant="title">
                {SERVICE_NAMES[service.serviceId]}
              </Typography>
              <Typography variant="caption" color="secondary">
                En attente de vérification
              </Typography>
            </Item>
          );
        });
      }
    }

    return items;
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 16 }}
      contentInsetAdjustmentBehavior="always"
      style={{ width: '100%', height: '100%' }}
    >
      {accountStore.accounts.length === 0 ? (
        <Stack
          vAlign="center"
          hAlign="center"
          padding={16}
          gap={0}
        >
          <Icon opacity={0.5} style={{ marginBottom: 8 }}>
            <UserX2Icon size={36} />
          </Icon>
          <Typography variant="h4" align="center">
            Aucun compte lié
          </Typography>
          <Typography variant="body1" color="secondary" align="center">
            Ajoute un compte depuis l'écran d'accueil.
          </Typography>
        </Stack>
      ) : (
        accountStore.accounts.map((account) => (
          <List key={account.id}>
            {renderAccountItems(account)}
          </List>
        ))
      )}
    </ScrollView>
  );
}
