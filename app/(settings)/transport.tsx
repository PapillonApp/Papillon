import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import * as React from 'react';
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Modal,
  ScrollView,
} from "react-native";

import SettingsHeader from "@/components/SettingsHeader";
import { AvailableTransportServices } from "@/constants/AvailableTransportServices";
import { useAccountStore } from "@/stores/account";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Typography from "@/ui/components/Typography";
import { AddressModal } from "@/app/(modals)/address";
import { TransportAddress } from "@/stores/account/types";

export default function TransportView() {
  const accountStore = useAccountStore();
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const { transport } = accounts.find(a => a.id === lastUsedAccount)!;

  const theme = useTheme();
  const { t } = useTranslation();

  const [transportEnabled, setTransportEnabled] = React.useState(transport?.enabled ?? false);

  const [showAddressSelect, setShowAddressSelect] = React.useState(false);
  const [addressSelectCanBeCurrentLocation, setAddressSelectCanBeCurrentLocation] = React.useState(false);

  const openAddressSelect = (currentLocationEnabled: boolean) => {
    setAddressSelectCanBeCurrentLocation(currentLocationEnabled);
    setShowAddressSelect(true);
  }

  const formatAddress = (address: TransportAddress | undefined): string => {
    if (address === undefined) {
      return t("Settings_Transport_Address_Not_Set");
    }
    if (address.firstTitle === "current_location") {
      return t("Settings_Transport_Current_Position");
    }
    return `${address.firstTitle}, ${address.secondTitle}`;
  };

  useEffect(
    () => accountStore.setTransportEnabled(transportEnabled),
    [transportEnabled]
  );

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        gap: 15,
        paddingTop: 82,
      }}
    >
      <SettingsHeader
        color={theme.dark ? "#231A0B" : "#FCF3E4"}
        title={t("Settings_Transport_Banner_Title")}
        description={t("Settings_Transport_Banner_Description")}
        iconName="Bus"
        imageSource={require("@/assets/images/transport.png")}
        showSwitch={true}
        switchColor={"#E8901C"}
        switchValue={transportEnabled}
        onSwitchChange={setTransportEnabled}
      />
      <Typography color={"secondary"}>
        {t("Settings_Transport_Address_Title")}
      </Typography>
      <List
        style={{ opacity: transportEnabled ? 1 : 0.5 }}
        pointerEvents={transportEnabled ? "auto" : "none"}
      >
        <Item onPress={() => openAddressSelect(true)}>
          <Leading>
            <Papicons name={"Home"} fill={theme.colors.text} opacity={0.7} />
          </Leading>
          <Trailing>
            <Papicons
              name={"ChevronRight"}
              fill={theme.colors.text}
              opacity={0.5}
            />
          </Trailing>
          <Typography numberOfLines={1}>
            {t("Settings_Transport_Address_Home_Title")}
          </Typography>
          <Typography color={"secondary"} numberOfLines={1}>
            {formatAddress(transport?.homeAddress)}
          </Typography>
        </Item>
        <Item onPress={() => openAddressSelect(false)}>
          <Leading>
            <Papicons name={"Grades"} fill={theme.colors.text} opacity={0.7} />
          </Leading>
          <Trailing>
            <Papicons
              name={"ChevronRight"}
              fill={theme.colors.text}
              opacity={0.5}
            />
          </Trailing>
          <Typography numberOfLines={1}>
            {t("Settings_Transport_Address_School_Title")}
          </Typography>
          <Typography color={"secondary"} numberOfLines={1}>
            {formatAddress(transport?.schoolAddress)}
          </Typography>
        </Item>
      </List>
      <Typography variant={"caption"} color={"secondary"} style={{marginTop: -15, marginBottom: 5}}>
        {t("Settings_Transport_Address_Description")}
      </Typography>
      <Typography color={"secondary"}>
        {t("Settings_Transport_Default_Application_Title")}
      </Typography>
      <List
        style={{ opacity: transportEnabled ? 1 : 0.5 }}
        pointerEvents={transportEnabled ? "auto" : "none"}
      >
        {AvailableTransportServices.map(service => (
          <Item
            onPress={() => accountStore.setTransportService(service.id)}
            key={service.id}
          >
            <Leading>
              <Image
                source={service.icon}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 16,
                }}
              />
            </Leading>
            {(transport?.defaultApp ?? 'transit') === service.id && (
              <Trailing>
                <Papicons name={"Check"} fill={"#E8901C"} />
              </Trailing>
            )}
            <Typography numberOfLines={1} variant={"title"}>
              {service.name}
            </Typography>
          </Item>
        ))}
      </List>
      <Modal
        presentationStyle={"pageSheet"}
        visible={showAddressSelect}
        allowSwipeDismissal={true}
        onRequestClose={() => setShowAddressSelect(false)}
        animationType={"slide"}
      >
        <AddressModal
          canUseCurrentLocation={addressSelectCanBeCurrentLocation}
          onCancel={() => setShowAddressSelect(false)}
          onConfirm={(item: TransportAddress) => {
            if (addressSelectCanBeCurrentLocation) {
              // Home
              accountStore.setTransportHomeAddress(item);
            } else {
              // School
              accountStore.setTransportSchoolAddress(item);
            }
            setShowAddressSelect(false);
          }}
        />
      </Modal>
    </ScrollView>
  );
}