import { Papicons } from "@getpapillon/papicons";
import { MenuView, NativeActionEvent } from "@react-native-menu/menu";
import { router } from "expo-router";
import React from "react";
import { Alert, Image, ScrollView } from "react-native";

import { removeBalanceFromDatabase } from "@/database/useBalance";
import { getManager } from "@/services/shared";
import { useAccountStore } from "@/stores/account";
import Avatar from "@/ui/components/Avatar";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { getInitials } from "@/utils/chats/initials";
import { formatSchoolName } from "@/utils/format/formatSchoolName";
import { getServiceLogo, getServiceName } from "@/utils/services/helper";
import ActionMenu from "@/ui/components/ActionMenu";
import { useTheme } from "expo-router/react-navigation";

export default function AccountsView() {
  const { colors } = useTheme();
  const accounts = useAccountStore(state => state.accounts);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const account = accounts.find(a => a.id === lastUsedAccount);
  const store = useAccountStore.getState();

  const services = account?.services;

  const askDeleteAccount = (targetAccount: (typeof accounts)[number]) => {
    Alert.alert(
      "Supprimer le compte",
      `${targetAccount.firstName} ${targetAccount.lastName}`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            store.removeAccount(targetAccount);
          },
        },
      ]
    );
  };

  const askDeleteService = (serviceId: string, serviceName: string) => {
    Alert.alert(serviceName, "Supprimer ce service ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          store.removeServiceFromAccount(serviceId);
          removeBalanceFromDatabase(serviceId);
          const manager = getManager();
          if (manager) {
            manager.removeService(serviceId);
          }
        },
      },
    ]);
  };

  return (
    <List
      style={{ flex: 1, backgroundColor: colors.overground }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        padding: 16,
        gap: 16,
      }}
    >
      <List.Section>
        <List.SectionTitle>
          <Icon size={20} opacity={0.6}><Papicons name="User" /></Icon>
          <List.Label>Profils utilisateur</List.Label>
        </List.SectionTitle>

        {accounts.map(account => (
          <List.Item key={account.id}>
            <List.Leading>
              <Avatar
                initials={getInitials(
                  account.firstName + " " + account.lastName
                )}
                imageUrl={
                  account.customisation?.profilePicture
                    ? "data:image/png;base64," +
                      account.customisation?.profilePicture
                    : undefined
                }
                size={38}
              />
            </List.Leading>
            <Typography variant="title">
              {account.firstName} {account.lastName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {account.className ? account.className + " " : ""}
              {formatSchoolName(account.schoolName ?? "")}
            </Typography>
            {account.id === lastUsedAccount && (
              <Typography color="primary" variant="body2">
                Compte actuellement utilisé
              </Typography>
            )}
            <List.Trailing>
              <ActionMenu
                actions={[
                  {
                    id: "delete",
                    title: "Supprimer",
                    attributes: { destructive: true },
                  },
                ]}
                onPressAction={(event: NativeActionEvent) => {
                  if (event.nativeEvent.event === "delete") {
                    askDeleteAccount(account);
                  }
                }}
              >
                <Icon opacity={0.7}>
                  <Papicons name="Dots" />
                </Icon>
              </ActionMenu>
            </List.Trailing>
          </List.Item>
        ))}
        <List.Item
          onPress={() =>
            router.push({
              pathname: "/(onboarding)/ageSelection",
              params: { action: "addService" },
            })
          }
        >
          <List.Leading>
            <Icon opacity={0.5} style={{ marginHorizontal: 7 }}>
              <Papicons name="add" />
            </Icon>
          </List.Leading>
          <Typography variant="title" color="textSecondary">
            Nouveau compte
          </Typography>
        </List.Item>
      </List.Section>


      <List.Section>
        <List.SectionTitle>
          <Icon size={20} opacity={0.6}><Papicons name="Card" /></Icon>
          <List.Label>Services et cartes</List.Label>
        </List.SectionTitle>

        {services?.map(service => (
          <List.Item key={service.id}>
            <List.Leading>
              <Image
                source={getServiceLogo(service.serviceId)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 4,
                }}
              />
            </List.Leading>
            <Typography variant="title">
              {getServiceName(service.serviceId)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Connecté le{" "}
              {new Date(service.createdAt).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Typography>
            <List.Trailing>
              <ActionMenu
                actions={[
                  {
                    id: "delete",
                    title: "Supprimer",
                    attributes: { destructive: true },
                  },
                ]}
                onPressAction={(event: NativeActionEvent) => {
                  if (event.nativeEvent.event === "delete") {
                    askDeleteService(
                      service.id,
                      getServiceName(service.serviceId)
                    );
                  }
                }}
              >
                <Icon opacity={0.7}>
                  <Papicons name="Dots" />
                </Icon>
              </ActionMenu>
            </List.Trailing>
          </List.Item>
        ))}
        <List.Item
          onPress={() =>
            router.navigate({
              pathname: "/(onboarding)/restaurants/method",
            })
          }
        >
          <List.Leading>
            <Icon opacity={0.5} style={{ marginHorizontal: 7 }}>
              <Papicons name="add" />
            </Icon>
          </List.Leading>
          <Typography variant="title" color="textSecondary">
            Ajouter un nouveau service
          </Typography>
        </List.Item>
      </List.Section>
    </List>
  );
}
