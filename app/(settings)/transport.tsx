import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import * as React from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Image } from "react-native";

import SettingsHeader from "@/components/SettingsHeader";
import { AvailableTransportServices } from "@/constants/AvailableTransportServices";
import { useAccountStore } from "@/stores/account";
import SheetModal from "@/ui/components/SheetModal";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { AddressModal } from "@/app/(modals)/address";
import { TransportAddress } from "@/stores/account/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";

export default function TransportView() {
  const accountStore = useAccountStore();
  const accounts = useAccountStore(state => state.accounts);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const { transport } = accounts.find(a => a.id === lastUsedAccount)!;

  const theme = useTheme();
  const { t } = useTranslation();

  const [transportEnabled, setTransportEnabled] = React.useState(
    transport?.enabled ?? false
  );

  const [showAddressSelect, setShowAddressSelect] = React.useState(false);
  const [
    addressSelectCanBeCurrentLocation,
    setAddressSelectCanBeCurrentLocation,
  ] = React.useState(false);

  const openAddressSelect = (currentLocationEnabled: boolean) => {
    setAddressSelectCanBeCurrentLocation(currentLocationEnabled);
    setShowAddressSelect(true);
  };

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

  const insets = useSafeAreaInsets();

  return (
    <List
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: 16,
      }}
      contentInsetAdjustmentBehavior="always"
    >
      <List.View style={{ marginBottom: 15 }}>
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
      </List.View>

      <List.SectionTitle>
        <List.Label>{t("Settings_Transport_Address_Title")}</List.Label>
      </List.SectionTitle>
      <List.Section id="transport-addresses">
        <List.Item
          onPress={() => {
            if (transportEnabled) {
              openAddressSelect(true);
            }
          }}
          style={{ opacity: transportEnabled ? 1 : 0.5 }}
        >
          <List.Leading>
            <Papicons name={"Home"} fill={theme.colors.text} opacity={0.7} />
          </List.Leading>
          <Typography numberOfLines={1}>
            {t("Settings_Transport_Address_Home_Title")}
          </Typography>
          <Typography color={"textSecondary"} numberOfLines={1}>
            {formatAddress(transport?.homeAddress)}
          </Typography>
          <List.Trailing>
            <Papicons
              name={"ChevronRight"}
              fill={theme.colors.text}
              opacity={0.5}
            />
          </List.Trailing>
        </List.Item>
        <List.Item
          onPress={() => {
            if (transportEnabled) {
              openAddressSelect(false);
            }
          }}
          style={{ opacity: transportEnabled ? 1 : 0.5 }}
        >
          <List.Leading>
            <Papicons name={"Grades"} fill={theme.colors.text} opacity={0.7} />
          </List.Leading>
          <Typography numberOfLines={1}>
            {t("Settings_Transport_Address_School_Title")}
          </Typography>
          <Typography color={"textSecondary"} numberOfLines={1}>
            {formatAddress(transport?.schoolAddress)}
          </Typography>
          <List.Trailing>
            <Papicons
              name={"ChevronRight"}
              fill={theme.colors.text}
              opacity={0.5}
            />
          </List.Trailing>
        </List.Item>
      </List.Section>
      <List.View style={{ marginVertical: 10 }}>
        <Typography variant={"caption"} color={"textSecondary"}>
          {t("Settings_Transport_Address_Description")}
        </Typography>
      </List.View>

      <List.SectionTitle>
        <List.Label>
          {t("Settings_Transport_Default_Application_Title")}
        </List.Label>
      </List.SectionTitle>
      <List.Section>
        {AvailableTransportServices.map(service => (
          <List.Item
            onPress={() => {
              if (transportEnabled) {
                accountStore.setTransportService(service.id);
              }
            }}
            key={service.id}
            style={{ opacity: transportEnabled ? 1 : 0.5 }}
          >
            <List.Leading>
              <Image
                source={service.icon}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 16,
                }}
              />
            </List.Leading>
            {(transport?.defaultApp ?? "transit") === service.id && (
              <List.Trailing>
                <Papicons name={"Check"} fill={"#E8901C"} />
              </List.Trailing>
            )}
            <Typography numberOfLines={1} variant={"title"}>
              {service.name}
            </Typography>
          </List.Item>
        ))}
      </List.Section>
      <List.View>
        <SheetModal
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
        </SheetModal>
      </List.View>
    </List>
  );
}
