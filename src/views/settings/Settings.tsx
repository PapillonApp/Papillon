import type { Screen } from "@/router/helpers/types";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Alert, Image, Platform, Text, View } from "react-native";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppJSON from "../../../app.json";

import Reanimated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
  ZoomIn,
  ZoomOut
} from "react-native-reanimated";

import {
  Bell,
  Cable,
  HandCoins,
  Info,
  Laptop,
  LogOut,
  Palette,
  Paperclip,
  Puzzle,
  Route,
  Scroll,
  Settings as SettingsLucide,
  Sparkles,
  SunMoon,
  Smile,
  SwatchBook,
  WandSparkles,
  X,
  Languages,
} from "lucide-react-native";

import { NativeIcon, NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import ModalHandle from "@/components/Modals/ModalHandle";
import AccountContainerCard from "@/components/Settings/AccountContainerCard";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {get_settings_widgets} from "@/addons/addons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {AddonPlacementManifest} from "@/addons/types";
import { useFlagsStore } from "@/stores/flags";
import { useAlert } from "@/providers/AlertProvider";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { animPapillon } from "@/utils/ui/animations";
import * as WebBrowser from "expo-web-browser";
import { WebBrowserPresentationStyle } from "expo-web-browser";

const Settings: Screen<"Settings"> = ({ route, navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount(store => store.account!);
  const [ addons, setAddons ] = useState<Array<AddonPlacementManifest>>([]);
  const [devModeEnabled, setDevModeEnabled] = useState(false);
  const defined = useFlagsStore(state => state.defined);
  const [click, setClick] = useState<true | false>(false);

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

  const tabs = [
    {
      icon: <SettingsLucide />,
      label: t("settings.sections.general.title"),
      tabs: [
        {
          icon: <Bell />,
          color: "#CF0029",
          label: t("settings.sections.general.notifications.title"),
          onPress: () => navigation.navigate("SettingsNotifications"),
        },
        {
          icon: <Cable />,
          color: "#D79400",
          label: t("settings.sections.general.externalServices.title"),
          onPress: () => navigation.navigate("SettingsExternalServices"),
        },
        {
          icon: <Smile />,
          color: "#136B00",
          label: t("settings.sections.general.reactions.title"),
          onPress: () => navigation.navigate("SettingsReactions"),
        },
      ],
    },
    {
      icon: <Palette />,
      label: t("settings.sections.customization.title"),
      tabs: [
        {
          icon: <SwatchBook />,
          color: "#5C9441",
          label: t("settings.sections.customization.subjects.title"),
          onPress: () => navigation.navigate("SettingsSubjects"),
        },
        {
          icon: <Sparkles />,
          color: "#295787",
          label: t("settings.sections.customization.appIcon.title"),
          onPress: () => navigation.navigate("SettingsIcons"),
          android: false,
        },
        {
          icon: <Palette />,
          color: "#3B117E",
          label: t("settings.sections.customization.colorTheme.title"),
          onPress: async () => {
            if (Platform.OS === "ios") {
              navigation.goBack();
            }
            setTimeout(() => {
              navigation.navigate("ColorSelector", { settings: true });
            }, 10);
          }
        },
        {
          icon: <SunMoon />,
          color: "#1e316a",
          label: t("settings.sections.customization.appearance.title"),
          onPress: () => navigation.navigate("SettingsApparence"),
        },
        {
          icon: <Languages />,
          color: "#5a5a5a",
          label: t("settings.sections.customization.language.title"),
          onPress: () => navigation.navigate("SettingsLanguage"),
        },
      ],
    },
    {
      icon: <Laptop />,
      label: t("settings.sections.advanced.title"),
      tabs: [
        {
          icon: click ? (
            <PapillonSpinner
              size={18}
              color="white"
              strokeWidth={2.8}
              entering={animPapillon(ZoomIn)}
              exiting={animPapillon(ZoomOut)}
            />) : <Route />,
          color: "#7E1174",
          label: t("settings.sections.advanced.tabsAndNavigation.title"),
          onPress: async () => {
            setClick(true);
            setTimeout(() => {
              if (Platform.OS === "ios") {
                navigation.goBack();
              }
              navigation.navigate("SettingsTabs");
              setClick(false);
            }, 10);
          },
        },
        {
          icon: <Puzzle />,
          color: "#bf547d",
          label: t("settings.sections.advanced.plugins.title"),
          description: t("settings.sections.advanced.plugins.subtitle"),
          onPress: () => navigation.navigate("SettingsAddons"),
          disabled: !defined("enable_addons"),
        },
        {
          icon: <WandSparkles />,
          color: "#58A3C3",
          label: t("settings.sections.advanced.magic.title"),
          description: t("settings.sections.advanced.magic.subtitle"),
          onPress: () => navigation.navigate("SettingsMagic"),
        },
      ],
    },
    {
      icon: <Laptop />,
      label: t("settings.sections.project.title"),
      tabs: [
        {
          icon: <Scroll />,
          color: "#c75110",
          label: t("settings.sections.project.whatsNew.title"),
          onPress: () => navigation.navigate("ChangelogScreen"),
        },
        {
          icon: <Info />,
          color: "#888888",
          label: t("settings.sections.project.about.title"),
          onPress: () => navigation.navigate("SettingsAbout"),
        }
      ],
    },
    {
      tabs: [
        {
          icon: <LogOut />,
          color: "#CF0029",
          label: t("settings.sections.logOut.title"),
          onPress: () => {
            if (Platform.OS === "ios") {
              Alert.alert(t("settings.sections.logOut.title"), t("settings.sections.logOut.confirmation"), [
                {
                  text: t("cancel"),
                  style: "cancel",
                },
                {
                  text: t("confirm"),
                  style: "destructive",
                  onPress: () => {
                    removeAccount(account.localID);
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "AccountSelector" }],
                    });
                  },
                },
              ]);
            } else {
              showAlert({
                title: t("settings.sections.logOut.title"),
                message: t("settings.sections.logOut.confirmation"),
                actions: [
                  {
                    title: t("cancel"),
                    onPress: () => {},
                    backgroundColor: colors.card,
                    icon: <X color={colors.text} />,
                  },
                  {
                    title: t("confirm"),
                    onPress: () => {
                      removeAccount(account.localID);
                      navigation.reset({
                        index: 0,
                        routes: [{ name: "AccountSelector" }],
                      });
                    },
                    primary: true,
                    backgroundColor: "#CF0029",
                    icon: <LogOut color="#FFFFFF" />,
                  },
                ],
              });
            }
          },
        },
      ]
    }
  ];

  if (Platform.OS === "android") {
    tabs[3].tabs.push({
      icon: <HandCoins />,
      color: "#f0a500",
      label: t("settings.sections.project.donate.title"),
      onPress: () => openUrl("https://papillon.bzh/donate"),
      android: true,
      description: ""
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
    navigation.setOptions({
      headerShown: Platform.OS === "android",
      headerTitle: t("settings.title"),
    });
  });

  return (
    <>
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

      <Reanimated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingTop: Platform.OS === "ios" ? 48 : 16,
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
        {tabs.map((tab, index) => (
          <View key={index}>
            {tab.label &&
              <NativeListHeader
                key={index}
                label={tab.label}
              />
            }
            <NativeList>
              {tab.tabs.map((subtab, index) => (
                (Platform.OS === "android" && "android" in subtab && !subtab.android) ? <View key={index} /> :
                  <NativeItem
                    key={index}
                    onPress={subtab.onPress}
                    disabled={"disabled" in subtab && subtab.disabled}
                    leading={
                      <NativeIcon
                        icon={subtab.icon}
                        color={subtab.color}
                        style={{
                          marginLeft: -6,
                        }}
                      />
                    }
                  >
                    <NativeText variant="title">
                      {subtab.label}
                    </NativeText>
                    {"description" in subtab && subtab.description &&
                      <NativeText variant="subtitle" style={{ marginTop: -3 }}>
                        {subtab.description}
                      </NativeText>
                    }
                  </NativeItem>
              ))}
            </NativeList>
          </View>
        ))}

        {devModeEnabled && (
          <View>
            <NativeListHeader label={t("settings.sections.devMode")}/>
            <NativeList>
              <NativeItem
                onPress={() => navigation.navigate("SettingsDevLogs")}
                leading={
                  <NativeIcon
                    icon={<Paperclip/>}
                    color={"#000"}
                    style={{
                      marginLeft: -6,
                    }}
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
          version {AppJSON.expo.version} {Platform.OS} {__DEV__ ? `(${t("settings.devMode")})` : ""} {"\n"}
          {t("settings.madeBy")}
        </Text>
      </Reanimated.ScrollView>
    </>
  );
};

export default Settings;
