import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { Image, ScrollView, TouchableOpacity } from "react-native";
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { useAccountStore } from "@/stores/account";
import Avatar from "@/ui/components/Avatar";
import Icon from "@/ui/components/Icon";
import Item, { Leading } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { getInitials } from "@/utils/chats/initials";
import { getServiceLogo, getServiceName } from "@/utils/services/helper";

export default function AccountsView() {
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const account = accounts.find((a) => a.id === lastUsedAccount);
  const theme = useTheme();

  const services = account?.services;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        padding: 16,
        gap: 16,
      }}
    >
      <Stack direction="horizontal" gap={8} hAlign="center" style={{
        opacity: 0.5,
      }}>
        <Icon size={20}>
          <Papicons name="user" />
        </Icon>
        <Typography variant="title">Profils utilisateur</Typography>
      </Stack>

      <List disablePadding>
        {accounts.map((account, index) => (
          <ReanimatedSwipeable
            containerStyle={{
              borderTopLeftRadius: index === 0 ? 20 : 0,
              borderTopRightRadius: index === 0 ? 20 : 0,
            }}
            overshootRight={false}
            key={account.id}
            renderRightActions={() => (
              <Stack direction="horizontal" width={64} gap={8}>
                <TouchableOpacity style={{ backgroundColor: "#C50000", height: "100%", width: "100%", justifyContent: "center", alignItems: "center" }}>
                  <Icon fill="white">
                    <Papicons name="trash" />
                  </Icon>
                </TouchableOpacity>
              </Stack>
            )}
          >
            <Item isLast={true} style={{
              backgroundColor: theme.colors.card,
            }}>
              <Leading>
                <Avatar
                  initials={getInitials(account.firstName + " " + account.lastName)}
                  imageUrl={account.customisation?.profilePicture ? "data:image/png;base64," + account.customisation?.profilePicture : undefined}
                  size={38}
                />
              </Leading>
              <Typography variant="title">{account.firstName} {account.lastName}</Typography>
              <Typography variant="body2" color="secondary">{account.className ? account.className + " " : ""}{account.schoolName}</Typography>
            </Item>
          </ReanimatedSwipeable>
        ))}
        <Item>
          <Icon opacity={0.5} style={{ marginHorizontal: 7 }}>
            <Papicons name="add" />
          </Icon>
          <Typography variant="title" style={{ opacity: 0.5 }}>
            Nouveau compte
          </Typography>
        </Item>
      </List>

      <Stack direction="horizontal" gap={8} hAlign="center" style={{
        opacity: 0.5,
      }}>
        <Icon size={20}>
          <Papicons name="card" />
        </Icon>
        <Typography variant="title">Services et cartes</Typography>
      </Stack>

      <List disablePadding>
        {services.map((service, index) => (
          <ReanimatedSwipeable
            containerStyle={{
              borderTopLeftRadius: index === 0 ? 20 : 0,
              borderTopRightRadius: index === 0 ? 20 : 0,
            }}
            overshootRight={false}
            key={service.id}
            renderRightActions={() => (
              <Stack direction="horizontal" width={64} gap={8}>
                <TouchableOpacity style={{ backgroundColor: "#C50000", height: "100%", width: "100%", justifyContent: "center", alignItems: "center" }}>
                  <Icon fill="white">
                    <Papicons name="trash" />
                  </Icon>
                </TouchableOpacity>
              </Stack>
            )}
          >
            <Item isLast={true} style={{
              backgroundColor: theme.colors.card,
            }}>
              <Leading>
                <Image
                  source={getServiceLogo(service.serviceId)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 4,
                  }}
                />
              </Leading>
              <Typography variant="title">{getServiceName(service.serviceId)}</Typography>
              <Typography variant="body2" color="secondary">Connecté le {new Date(service.createdAt).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}</Typography>
            </Item>
          </ReanimatedSwipeable>
        ))}
        <Item>
          <Icon opacity={0.5} style={{ marginHorizontal: 7 }}>
            <Papicons name="add" />
          </Icon>
          <Typography variant="title" style={{ opacity: 0.5 }}>
            Ajouter un nouveau service
          </Typography>
        </Item>
      </List>
    </ScrollView >
  );
}