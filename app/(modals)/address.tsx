import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableNativeFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TransportAddress } from "@/stores/account/types";
import Button from "@/ui/components/Button";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Search from "@/ui/components/Search";
import Typography from "@/ui/components/Typography";
import { useHeaderHeight } from "@react-navigation/elements";
import AndroidBackButton, { AndroidBackButtonStyles } from "@/utils/theme/AndroidBackButton";
import Icon from "@/ui/components/Icon";

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
  lineLimit?: number;
}

const AddressItem = ({
  icon,
  firstLine,
  secondLine,
  convertFunction,
  save,
  lineLimit = 1,
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
      <Typography color={"secondary"} variant={"body2"} numberOfLines={lineLimit}>
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

  const [status, requestPermission] = Location.useForegroundPermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<TransportAddress[]>([]);

  let timeout: ReturnType<typeof setTimeout> | null = null;

  const search = async () => {
    const geocodes = await Location.geocodeAsync(searchTerm);
    const results = geocodes.slice(0, 5).map((item) => ({
      firstTitle: searchTerm,
      secondTitle: `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`,
      address: searchTerm,
      latitude: item.latitude,
      longitude: item.longitude,
    }));
    setSearchResults(results);
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

  useEffect(() => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    if (searchTerm.length === 0) {
      setSearchResults([]);
      return;
    }
    timeout = setTimeout(() => search(), 200);
  }, [searchTerm]);

  const finalHeaderHeight = Platform.select({
    android: insets.top,
    default: 0
  });

  return (
    <View
      style={{
        flex: 1,
        paddingTop: 0 + finalHeaderHeight,
        paddingBottom: insets.bottom,
        backgroundColor: theme.colors.background,
      }}
    >
      <View
        style={{
          marginTop: 14,
          top: finalHeaderHeight,
          position: "absolute",
          zIndex: 9999,
          left: 14,
          right: 14,
          flexDirection: "row",
        }}
      >
        {Platform.OS === "android" && (
          <TouchableNativeFeedback
            onPress={onCancel}
            useForeground
          >
            <View style={AndroidBackButtonStyles.container}>
              <Icon size={26}>
                <Papicons name="arrowleft" />
              </Icon>
            </View>
          </TouchableNativeFeedback>
        )}
        <Search
          placeholder={t("Settings_Transport_Search_Address_Placeholder")}
          color="#E8901C"
          onTextChange={setSearchTerm}
          style={{
            width: Dimensions.get("window").width - (14 * 2) - (Platform.OS === "android" ? 52 : 0),
          }}
        />
      </View>
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
                  lineLimit={2}
                />
              </List>
            )}

            {searchResults.length > 0 && (
              <>
                <Typography variant={"h6"} color={"secondary"}>
                  {t("Settings_Transport_Place")}
                </Typography>
                <List>
                  {searchResults.map((item: TransportAddress, index: number) => (
                    <AddressItem
                      key={`${item.latitude}-${item.longitude}-${index}`}
                      icon={"MapPin"}
                      firstLine={item.firstTitle}
                      secondLine={item.secondTitle}
                      convertFunction={() => Promise.resolve(item)}
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
