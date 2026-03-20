import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { fetch } from "expo-fetcher";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import * as React from 'react';
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SettingsHeader from "@/components/SettingsHeader";
import { AvailableTransportServices } from "@/constants/AvailableTransportServices";
import { useAccountStore } from "@/stores/account";
import Button from "@/ui/components/Button";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Search from "@/ui/components/Search";
import Typography from "@/ui/components/Typography";

interface SearchResult {
  title: string;
  description: string;
  stop: boolean;
}

function AddressSearchView(params: {
  canUseCurrentLocation: boolean;
  onCancel: () => void;
  onSelectCurrentLocation: () => void;
  onSelectAddress: (item: SearchResult) => void;
}) {
  const [status, requestPermission] = Location.useForegroundPermissions();
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResult, setSearchResult] = React.useState<SearchResult[]>([]);

  let timeout: number | null = null;

  const search = async () => {
    const location = await Location.getCurrentPositionAsync();
    const f = await fetch(
      `https://transitapp.com/en/trip/api/suggestions?lat=${location.coords.latitude}&lng=${location.coords.longitude}&search-term=${searchTerm}`,
      {
        headers: {
          Referer: "https://transitapp.com/fr/trip",
        },
      }
    );
    const json = await f.json();
    const results: SearchResult[] = [];

    json.suggestions.places.forEach(
      (place: {
        structured_formatting: {
          main_text: string;
          secondary_text: string;
        };
        description: string;
      }) => {
        results.push({
          title: place.structured_formatting.main_text,
          description: place.structured_formatting.secondary_text,
          stop: false,
        });
      }
    );
    json.suggestions.stops.forEach((stop: {stop_name: string, city_name: string}) => {
      results.push({
        title: stop.stop_name,
        description: stop.city_name,
        stop: true,
      });
    });

    setSearchResult(results);
  }

  useEffect(() => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => search(), 200);
  }, [searchTerm]);

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: insets.bottom,
        backgroundColor: theme.colors.background,
      }}
    >
      <Search
        placeholder={t("Settings_Transport_Search_Address_Placeholder")}
        color="#E8901C"
        onTextChange={setSearchTerm}
        style={{
          marginTop: 14,
          position: "absolute",
          zIndex: 9999,
          left: 14,
        }}
      />
      {status === null || status?.granted ? (
        <KeyboardAvoidingView
          style={{
            height: "100%",
          }}
          behavior={"height"}
          keyboardVerticalOffset={70}
        >
          <ScrollView
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            contentContainerStyle={{
              paddingTop: 56 + 14,
              paddingHorizontal: 16,
              paddingBottom: 56 + 14,
            }}
          >
            <List>
              {searchResult.length === 0 && params.canUseCurrentLocation && (
                <Item onPress={params.onSelectCurrentLocation}>
                  <Leading>
                    <Papicons name={"MapPin"} fill={theme.colors.text} />
                  </Leading>
                  <Typography variant={"title"}>
                    {t("Settings_Transport_Current_Position")}
                  </Typography>
                  <Typography color={"secondary"} variant={"body2"}>
                    {t("Settings_Transport_Current_Position_Description")}
                  </Typography>
                </Item>
              )}
              {searchResult.map((item, index) => (
                <Item key={index} onPress={() => params.onSelectAddress(item)}>
                  <Leading>
                    <Papicons
                      name={item.stop ? "Bus" : "MapPin"}
                      fill={theme.colors.text}
                    />
                  </Leading>
                  <Typography variant={"title"}>{item.title}</Typography>
                  <Typography color={"secondary"} variant={"body2"}>
                    {item.description}
                  </Typography>
                </Item>
              ))}
            </List>
          </ScrollView>
          <View
            style={{
              padding: 16,
              marginTop: "auto",
            }}
          >
            <Button
              title={t("Cancel")}
              variant={"ghost"}
              inline={true}
              onPress={params.onCancel}
            />
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View
          style={{
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 16,
          }}
        >
          <Papicons
            name={"Ghost"}
            size={64}
            style={{ marginBottom: 16 }}
            fill={theme.colors.text}
          />
          <Typography variant={"h3"} style={{ textAlign: "center" }}>
            {t("Settings_Transport_Localisation_Needed")}
          </Typography>
          <Typography
            variant={"body1"}
            color={"secondary"}
            style={{
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {t("Settings_Transport_Localisation_Needed_Description")}
          </Typography>
          <Button
            title={t("Settings_Transport_Localisation_Request")}
            variant={"light"}
            color={"blue"}
            onPress={() => {
              if (status?.canAskAgain) {
                requestPermission();
              } else {
                Linking.openSettings();
              }
            }}
          />
        </View>
      )}
    </View>
  );
}

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

  const formatAddress = (address: { title: string, address: string } | undefined): string => {
    if (address === undefined) {
      return t("Settings_Transport_Address_Not_Set");
    }
    if (address.title === "current_location") {
      return t("Settings_Transport_Current_Position");
    }
    return address.title;
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
      <Typography variant={"caption"} color={"secondary"}>
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
                source={{
                  uri: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Transit_App_icon.png/250px-Transit_App_icon.png",
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
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
        <AddressSearchView
          canUseCurrentLocation={addressSelectCanBeCurrentLocation}
          onCancel={() => setShowAddressSelect(false)}
          onSelectAddress={(item: SearchResult) => {
            const formatedAddress = {
              title: `${item.title}, ${item.description}`,
              address: item.stop ? item.title : `${item.title} ${item.description}`,
            };
            if (addressSelectCanBeCurrentLocation) {
              // Home
              accountStore.setTransportHomeAddress(formatedAddress);
            } else {
              // School
              accountStore.setTransportSchoolAddress(formatedAddress);
            }
            setShowAddressSelect(false);
          }}
          onSelectCurrentLocation={() => {
            // Only home can be set as current location
            accountStore.setTransportHomeAddress({
              title: "current_location",
              address: "current_location",
            });
            setShowAddressSelect(false);
          }}
        />
      </Modal>
    </ScrollView>
  );
}