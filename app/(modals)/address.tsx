import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Transit from "@/services/transit";
import { PlaceSuggestion } from "@/services/transit/models/PlaceSuggestion";
import { Stop } from "@/services/transit/models/Stop";
import { TransportAddress } from "@/stores/account/types";
import Button from "@/ui/components/Button";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Search from "@/ui/components/Search";
import Typography from "@/ui/components/Typography";

export interface AddressModalProps {
  canUseCurrentLocation: boolean;
  onCancel: () => void;
  onConfirm: (address: TransportAddress) => void;
}

interface AddressItemProps {
  icon: string;
  firstLine: string;
  secondLine: string;
  convertFunction: () => Promise<TransportAddress>;
  save: (addess: TransportAddress) => void;
}

const AddressItem = ({
  icon,
  firstLine,
  secondLine,
  convertFunction,
  save,
}: AddressItemProps) => {
  const theme = useTheme();

  const [savingAddress, setSavingAddress] = useState<boolean>(false);

  const saveAddress = async () => {
    setSavingAddress(true);
    const address = await convertFunction();
    save(address);
    setSavingAddress(false);
  };

  return (
    <Item onPress={saveAddress} disablePadding={true} isLast={true}>
      <Leading>
        <Papicons name={icon} fill={theme.colors.text} />
      </Leading>
      {savingAddress && (
        <Trailing>
          <ActivityIndicator />
        </Trailing>
      )}
      <Typography variant={"title"} numberOfLines={1}>
        {firstLine}
      </Typography>
      <Typography color={"secondary"} variant={"body2"} numberOfLines={1}>
        {secondLine}
      </Typography>
    </Item>
  );
};

export const AddressModal = ({
  canUseCurrentLocation,
  onCancel,
  onConfirm,
}: AddressModalProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const transit = new Transit();

  const [status, requestPermission] = Location.useForegroundPermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPlaceResults, setSearchPlaceResults] = useState<
    PlaceSuggestion[]
  >([]);
  const [searchStopResults, setSearchStopResults] = useState<Stop[]>([]);

  let timeout: number | null = null;

  const search = async () => {
    const location = await Location.getCurrentPositionAsync();
    const res = await transit.suggestions(
      location.coords.latitude,
      location.coords.longitude,
      searchTerm
    );

    setSearchPlaceResults(res.suggestions.places);
    setSearchStopResults(res.suggestions.stops);
  };

  const currentLocationToTransportAddress =
    async (): Promise<TransportAddress> => {
      return new Promise(resolve => {
        resolve({
          firstTitle: "current_location",
          secondTitle: "current_location",
          address: "current_location",
          latitude: -1,
          longitude: -1,
        });
      });
    };

  const placeToTransportAddress = async (
    place: PlaceSuggestion
  ): Promise<TransportAddress> => {
    const details = await transit.locationDetails(place.place_id);

    return {
      firstTitle: place.structured_formatting.main_text,
      secondTitle: place.structured_formatting.secondary_text,
      address: details.placeDetails.result.formatted_address,
      latitude: details.placeDetails.result.geometry.location.lat,
      longitude: details.placeDetails.result.geometry.location.lng,
    };
  };

  const stopToTransportAddress = async (
    stop: Stop
  ): Promise<TransportAddress> => {
    return new Promise(resolve => {
      resolve({
        firstTitle: stop.stop_name,
        secondTitle: stop.city_name,
        address: `${stop.stop_name}, ${stop.city_name}`,
        latitude: stop.stop_lat,
        longitude: stop.stop_lon,
      });
    });
  };

  useEffect(() => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    if (searchTerm.length === 0) {
      setSearchPlaceResults([]);
      setSearchStopResults([]);
      return;
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
              gap: 8,
            }}
          >
            {searchTerm.length === 0 && canUseCurrentLocation && (
              <List>
                <AddressItem
                  icon={"MapPin"}
                  firstLine={t("Settings_Transport_Current_Position")}
                  secondLine={t(
                    "Settings_Transport_Current_Position_Description"
                  )}
                  convertFunction={currentLocationToTransportAddress}
                  save={onConfirm}
                />
              </List>
            )}

            {searchPlaceResults.length > 0 && (
              <>
                <Typography variant={"h6"} color={"secondary"}>
                  {t("Settings_Transport_Place")}
                </Typography>
                <List>
                  {searchPlaceResults.map((item: PlaceSuggestion) => (
                    <AddressItem
                      key={item.place_id}
                      icon={"MapPin"}
                      firstLine={item.structured_formatting.main_text}
                      secondLine={item.structured_formatting.secondary_text}
                      convertFunction={() => placeToTransportAddress(item)}
                      save={onConfirm}
                    />
                  ))}
                </List>
              </>
            )}

            {searchStopResults.length > 0 && (
              <>
                <Typography variant={"h6"} color={"secondary"}>
                  {t("Settings_Transport_Stops")}
                </Typography>
                <List>
                  {searchStopResults.map((item: Stop) => (
                    <AddressItem
                      key={item.raw_stop_id}
                      icon={"Bus"}
                      firstLine={item.stop_name}
                      secondLine={item.city_name}
                      convertFunction={() => stopToTransportAddress(item)}
                      save={onConfirm}
                    />
                  ))}
                </List>
              </>
            )}
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
              onPress={onCancel}
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
};