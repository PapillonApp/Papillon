import type { Screen } from "@/router/helpers/types";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Image, Platform, Text, View } from "react-native";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PackageJSON from "../../../package.json";

import Reanimated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";

import {
  HandCoins,
  Info,
  LogOut,
  Palette,
  Paperclip,
  Settings as SettingsLucide,
  WandSparkles,
  X,
  PersonStanding,
  BadgeHelp
} from "lucide-react-native";

export interface SettingsSubItem {
  icon: React.ReactNode;
  colors: string[];
  label: string;
  description?: string;
  onPress: () => void;
  android?: boolean;
  beta?: boolean;
  disabled?: boolean;
}

import { NativeIconGradient, NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import ModalHandle from "@/components/Modals/ModalHandle";
import AccountContainerCard from "@/components/Settings/AccountContainerCard";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import {get_settings_widgets} from "@/addons/addons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {AddonPlacementManifest} from "@/addons/types";
import { useFlagsStore } from "@/stores/flags";
import { useAlert } from "@/providers/AlertProvider";
import * as WebBrowser from "expo-web-browser";
import { WebBrowserPresentationStyle } from "expo-web-browser";
import useScreenDimensions from "@/hooks/useScreenDimensions";

const Settings: Screen<"Settings"> = ({ route, navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount(store => store.account!);
  const [ addons, setAddons ] = useState<Array<AddonPlacementManifest>>([]);
  const [devModeEnabled, setDevModeEnabled] = useState(false);
  const defined = useFlagsStore(state => state.defined);
  const [click, setClick] = useState<true | false>(false);
  const { isTablet } = useScreenDimensions();

  const removeAccount = useAccounts((store) => store.remove);

  const openUrl = (url: string) => {
    WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowserPresentationStyle.FORM_SHEET,
      controlsColor: theme.colors.primary,
    });
  };

  useEffect(() => {
    AsyncStorage.getItem("devmode")
      .then((res) => {
        let value = {enabled: false};
        if (res)
          value = JSON.parse(res);
        setDevModeEnabled(value.enabled);
      });
  }, []);

  useEffect(() => {
    if (route.params?.view) {
      // @ts-expect-error : on ignore le state de navigation
      navigation.navigate(route.params.view);
    }
  }, [route.params]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      setTimeout(() => {
        get_settings_widgets().then((addons) => {
          setAddons(addons);
        });
      }, 1);
    });

    return unsubscribe;
  }, []);

  const { showAlert } = useAlert();

  const menuItems = [
    {
      icon: <SettingsLucide />,
      colors: ["#1E88E5", "#64B5F6"],
      label: "Général",
      description: "Notifications et services",
      onPress: () => navigation.navigate("SettingsGeneral"),
    },
    {
      icon: <Palette />,
      colors: ["#43A047", "#81C784"],
      label: "Personnalisation",
      description: "Apparence et navigation",
      onPress: () => navigation.navigate("SettingsPersonalization"),
    },
    {
      icon: <PersonStanding />,
      colors: ["#8E24AA", "#BA68C8"],
      label: "Accessibilité",
      description: "Options d'accessibilité",
      onPress: () => navigation.navigate("SettingsAccessibility"),
    },
    {
      icon: <WandSparkles />,
      colors: ["#FB8C00", "#FFB74D"],
      label: "Expérimental",
      description: "Fonctionnalités en bêta",
      onPress: () => navigation.navigate("SettingsExperimental"),
    },
    {
      icon: <Info />,
      colors: ["#546E7A", "#90A4AE"],
      label: "Projet Papillon",
      description: "À propos et support",
      onPress: () => navigation.navigate("SettingsProject"),
    },
  ];

  if (Platform.OS === "android") {
    menuItems.push({
      icon: <HandCoins />,
      colors: ["#F57C00", "#FFB74D"],
      label: "Soutenir Papillon",
      description: "Faire un don",
      onPress: () => openUrl("https://papillon.bzh/donate"),
    });
  }

  const translationY = useSharedValue(0);
  const [scrolled, setScrolled] = useState(false);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    translationY.value = event.contentOffset.y;
    const yOffset = event.contentOffset.y;

    runOnJS(setScrolled)(yOffset > 30);
  });

  // show header on Android
  useLayoutEffect(() => {
    navigation.setOptions(
      Platform.OS === "android" ? {
        headerShown: true,
      } : {
        headerTransparent: true,
        headerTitle: () => (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: -48,
            }}
          >
            {!scrolled && Platform.OS === "ios" &&
              <Reanimated.View
                exiting={FadeOut.duration(100)}
                entering={FadeIn.duration(100)}
                style={{
                  zIndex: 1000,
                }}
              >
                <ModalHandle />
              </Reanimated.View>
            }
          </View>
        ),
      });
  });

  return (
    <>
      <Reanimated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingTop: Platform.OS === "ios" ? 0 : 16,
          paddingHorizontal: 16,
          paddingBottom: Platform.OS === "ios" ? 16 : insets.bottom + 16,
        }}
      >
        <AccountContainerCard
          account={account}
          onPress={() => navigation.navigate("SettingsProfile")}
        />
        {addons.length > 0 &&
            <>
              <NativeListHeader label={"Extensions"}/>
              <NativeList>
                {addons.map((addon, index) => (
                  <NativeItem
                    key={index}
                    onPress={() => navigation.navigate("AddonSettingsPage", { addon, from: "Settings" })}
                    leading={
                      <Image
                        source={addon.manifest.icon == "" ? require("../../../assets/images/addon_default_logo.png"): {uri: addon.manifest.icon}}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 9,
                          borderWidth: 1,
                          borderColor: "#00000015",
                          marginLeft: -6,
                        }}
                      />
                    }
                  >
                    <NativeText variant="title" numberOfLines={1}>
                      {addon.manifest.name}
                    </NativeText>
                  </NativeItem>
                ))}
              </NativeList>
            </>
        }

        <NativeList>
          {menuItems.map((item, index) => (
            <NativeItem
              key={index}
              onPress={item.onPress}
              leading={
                <NativeIconGradient
                  icon={item.icon}
                  colors={item.colors}
                />
              }
            >
              <NativeText variant="title">
                {item.label}
              </NativeText>
              {"description" in item && item.description &&
                <NativeText variant="subtitle" style={{ marginTop: -3 }}>
                  {item.description}
                </NativeText>
              }
            </NativeItem>
          ))}
        </NativeList>

        <NativeList style={{ marginTop: 16 }}>
          <NativeItem
            onPress={() => {
              showAlert({
                title: "Se déconnecter",
                message: "Veux-tu vraiment te déconnecter ?",
                icon: <BadgeHelp />,
                actions: [
                  {
                    title: "Annuler",
                    icon: <X />,
                    primary: false,
                  },
                  {
                    title: "Déconnexion",
                    onPress: () => {
                      removeAccount(account.localID);
                      setTimeout(() => {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "AccountSelector" }],
                        });
                      }, 100);
                    },
                    danger: true,
                    icon: <LogOut />,
                    delayDisable: 5,
                  },
                ],
              });
            }}
            leading={
              <NativeIconGradient
                icon={<LogOut />}
                colors={["#E53935", "#EF5350"]}
              />
            }
          >
            <NativeText variant="title">
              Se déconnecter
            </NativeText>
          </NativeItem>
        </NativeList>

        {devModeEnabled && (
          <View>
            <NativeListHeader label={"Développeur"}/>
            <NativeList>
              <NativeItem
                onPress={() => navigation.navigate("SettingsDevLogs")}
                leading={
                  <NativeIconGradient
                    icon={<Paperclip/>}
                    colors={["#757575", "#BDBDBD"]}
                  />
                }
              >
                <NativeText variant="title">
                  Logs
                </NativeText>
              </NativeItem>
            </NativeList>
          </View>
        )}

        <Text
          style={{
            color: colors.text + "60",
            fontFamily: "medium",
            fontSize: 12.5,
            textAlign: "center",
            marginTop: 24,
          }}
        >
          version {PackageJSON.version} {Platform.OS} {__DEV__ ? "(développeur)" : ""} {"\n"}
          fabriqué avec ❤️ par les contributeurs Papillon
        </Text>
      </Reanimated.ScrollView>
    </>
  );
};

export default Settings;
