import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { View, Switch } from "react-native";
import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import { useCurrentAccount } from "@/stores/account";
import { useTheme } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import {
  AlertTriangle,
  Captions,
  Equal,
  SendToBack,
  Gift,
  Undo2,
  BadgeInfo,
} from "lucide-react-native";
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  ShadowDecorator,
} from "react-native-draggable-flatlist";
import { PressableScale } from "react-native-pressable-scale";
import Reanimated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { defaultTabs } from "@/consts/DefaultTabs";
import { log } from "@/utils/logger/logger";
import { useAlert } from "@/providers/AlertProvider";

// Types for Tab and Account
interface Tab {
  tab: string;
  label: string;
  enabled: boolean;
  installed: boolean;
  icon: any; // Should be updated if Lottie icon types are more specific
}

interface Personalization {
  tabs: Array<{ name: string; enabled: boolean; installed: boolean }>;
  hideTabTitles?: boolean;
  showTabBackground?: boolean;
}

interface Account {
  personalization: Personalization;
}

const SettingsTabs = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount((store) => store.account!);
  const mutateProperty = useCurrentAccount((store) => store.mutateProperty);

  const safeTabs = ["Home"];

  const [loading, setLoading] = useState<true | false>(true);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [newTabs, setNewTabs] = useState<Tab[]>([]);
  const [hideTabTitles, setHideTabTitles] = useState(false);
  const [showTabBackground, setShowTabBackground] = useState(false);
  const [failAnimation, setFailAnimation] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showNewTabsNotification, setShowNewTabsNotification] = useState(false);

  // Refs for Lottie animations
  const lottieRefs = useRef<(React.RefObject<LottieView> | null)[]>([]);

  // Update Lottie refs when tabs change
  useEffect(() => {
    lottieRefs.current = tabs.map((_, i) => lottieRefs.current[i] || React.createRef<LottieView>());
  }, [tabs]);

  const toggleTab = (tab: string) => {
    void (async () => {
      const isTabEnabled = tabs.find((t) => t.tab === tab)?.enabled ?? false;
      const enabledTabsCount = tabs.filter((t) => t.enabled).length;

      if (!isTabEnabled && enabledTabsCount === 5) {
        playFailAnimation();
        return;
      }

      const updatedTabs = tabs.map((t) =>
        t.tab === tab ? { ...t, enabled: !t.enabled } : t
      );

      setTabs(updatedTabs);
      updatePersonalizationTabs(updatedTabs);
    })();
  };

  const playFailAnimation = () => {
    setFailAnimation(true);
    setTimeout(() => setFailAnimation(false), 900);
  };

  const updatePersonalizationTabs = (updatedTabs: Tab[]) => {
    mutateProperty("personalization", {
      ...account.personalization,
      tabs: updatedTabs.map(({ tab, enabled, installed }) => ({
        name: tab,
        enabled,
        installed,
      })),
    });
  };

  useLayoutEffect(() => {
    const loadTabs = async () => {
      if (account.personalization.tabs) {
        const storedTabs = account.personalization.tabs;
        const updatedTabs = storedTabs
          .map((storedTab) => {
            const defaultTab = defaultTabs.find((t) => t.tab === storedTab.name);
            return defaultTab
              ? { ...defaultTab, enabled: storedTab.enabled, installed: true }
              : null;
          })
          .filter((tab) => tab !== null);

        const newTabsFound: Tab[] = defaultTabs.filter((defaultTab) => !storedTabs.some((storedTab) => storedTab.name === defaultTab.tab)).map((tab) => ({ ...tab, installed: true }));

        setTabs(updatedTabs);
        setNewTabs(newTabsFound);
        setShowNewTabsNotification(newTabsFound.length > 0);
      } else {
        log("No tabs found in account, using default tabs.", "SettingsTabs");
        setTabs(defaultTabs.map((tab) => ({ ...tab, installed: true })));
        updatePersonalizationTabs(defaultTabs.map((tab) => ({ ...tab, installed: true })));
      }

      setHideTabTitles(account.personalization.hideTabTitles ?? false);
      setShowTabBackground(account.personalization.showTabBackground ?? false);
      setLoading(false);
    };

    loadTabs();
  }, []);

  const handleAddNewTabs = () => {
    log("Adding new tabs.", "SettingsTabs");
    const updatedTabs = [
      ...tabs,
      ...newTabs.map((tab) => ({ ...tab, installed: true, enabled: false })),
    ];
    setTabs(updatedTabs);
    updatePersonalizationTabs(updatedTabs);
    setNewTabs([]);
    setShowNewTabsNotification(false);
  };

  useEffect(() => {
    log("Ensuring Home tab is in the correct position.", "SettingsTabs");
    void (async () => {
      const newTabs = [...tabs];
      const homeIndex = newTabs.findIndex((tab) => tab.tab === "Home");

      if (homeIndex > 4) {
        const homeTab = newTabs.splice(homeIndex, 1)[0];
        newTabs.splice(4, 0, homeTab);
        setTabs(newTabs);
      }
      setLoading(false);
    })();
  }, [tabs]);

  useEffect(() => {
    void (async () => {
      mutateProperty("personalization", {
        ...account.personalization,
        hideTabTitles,
        showTabBackground,
      });
    })();
  }, [hideTabTitles, showTabBackground]);

  const resetTabs = () => {
    log("Resetting tabs to default.", "SettingsTabs");
    const resetTabs = defaultTabs.map((tab) => ({
      ...tab,
      enabled: tab.tab === "Home" || tab.tab === "Lessons" || tab.tab === "Homeworks" || tab.tab === "Grades" || tab.tab === "News", // Tabs Home, Lessons, Homeworks and Grades are enabled by default
      installed: true,
    }));
    setTabs(resetTabs);
    updatePersonalizationTabs(resetTabs);
    setHideTabTitles(false);
    setShowTabBackground(false);
  };

  const { showAlert } = useAlert();

  return (
    <View>
      <NestableScrollContainer
        contentContainerStyle={{
          paddingBottom: 16 + insets.bottom,
        }}
      >
        <View
          style={{
            padding: 16,
            paddingTop: 0,
          }}
        >


          <NativeList>
            <View
              style={{
                backgroundColor: theme.colors.primary + "22",
                borderRadius: 0,
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 10,
                  backgroundColor: theme.colors.card,
                  shadowColor: "black",
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  paddingVertical: 8,
                  paddingHorizontal: 6,
                  height: 58,
                }}
              >
                {tabs.filter((tab) => tab.enabled).map((tab, index) => {
                  return (
                    <Reanimated.View
                      key={tab.tab}
                      style={{ flex: 1 }}
                      layout={LinearTransition.springify().mass(1).damping(20).stiffness(300)}
                      entering={ZoomIn}
                      exiting={ZoomOut}
                    >
                      <PressableScale
                        activeScale={0.85}
                        weight="light"
                        style={{
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                          paddingHorizontal: 4,
                          gap: 2,
                        }}
                        onPress={() => {
                          setPreviewIndex(index);
                          lottieRefs.current[index]?.current?.reset();
                          lottieRefs.current[index]?.current?.play();
                        }}
                      >
                        <Reanimated.View
                          layout={LinearTransition}
                          style={[
                            {
                              width: 22,
                              height: 22,
                              alignItems: "center",
                              justifyContent: "center",
                            },
                            showTabBackground && !hideTabTitles && {
                              backgroundColor: index == previewIndex ? theme.colors.primary + "22" : "transparent",
                              borderRadius: 30,
                              paddingHorizontal: 4,
                              paddingVertical: 2,
                              width: 50,
                              height: 28,
                            },
                            showTabBackground && hideTabTitles && {
                              backgroundColor: index == previewIndex ? theme.colors.primary + "22" : "transparent",
                              height: 36,
                              width: 36,
                              borderRadius: 8,
                              paddingHorizontal: 6,
                              paddingVertical: 6,
                            },
                            !showTabBackground && hideTabTitles && {
                              height: 26,
                              width: 26,
                            },
                          ]}
                        >
                          <LottieView
                            autoPlay={true}
                            loop={false}
                            source={tab.icon}
                            colorFilters={[{
                              keypath: "*",
                              color: index == previewIndex ? theme.colors.primary : theme.colors.text,
                            }]}
                            style={{
                              width: "100%",
                              height: "100%",
                              marginVertical: hideTabTitles ? 8 : 0,
                            }}
                            ref={lottieRefs.current[index]}
                          />
                        </Reanimated.View>
                        {!hideTabTitles && (
                          <Reanimated.Text
                            style={{
                              color: index == previewIndex ? theme.colors.primary : theme.colors.text,
                              fontFamily: "semibold",
                              fontSize: 12.5,
                            }}
                            numberOfLines={1}
                            entering={FadeIn}
                            exiting={FadeOut.duration(100)}
                            layout={LinearTransition}
                          >
                            {tab.label}
                          </Reanimated.Text>
                        )}
                      </PressableScale>
                    </Reanimated.View>
                  );
                })}

                {failAnimation && (
                  <Reanimated.View
                    layout={LinearTransition}
                    style={{
                      width: 42,
                      height: 40,
                      backgroundColor: "#CCA50023",
                      borderRadius: 8,
                      alignItems: "center",
                      justifyContent: "center",
                      marginHorizontal: 4,
                    }}
                    entering={ZoomIn.springify().mass(1).damping(20).stiffness(500)}
                    exiting={FadeOut.duration(100)}
                  >
                    <AlertTriangle
                      size={20}
                      color={"#CCA500"}
                    />
                  </Reanimated.View>
                )}
              </View>
            </View>
            <NativeItem>
              <NativeText variant="title">
                Rangement des sections
              </NativeText>
              <NativeText variant="subtitle">
                Tu peux choisir jusqu'à 5 onglets à afficher sur la page d'accueil.
              </NativeText>
            </NativeItem>

          </NativeList>

          <NativeListHeader label="Réorganiser les onglets" />

          <NativeList>
            {showNewTabsNotification && (
              <NativeItem
                leading={
                  <Gift color={theme.colors.primary} size={28} strokeWidth={2} />
                }
                onPress={handleAddNewTabs}
                style={{
                  backgroundColor: theme.colors.primary + "30",
                }}
                androidStyle={{
                  backgroundColor: theme.colors.primary + "20",
                }}
              >
                <NativeText variant="title">Nouveaux onglets disponibles !</NativeText>
                <NativeText variant="subtitle">
                  {newTabs.map((tab) => tab.label).join(", ")}. Appuie ici pour les ajouter.
                </NativeText>
              </NativeItem>
            )}

            <NestableDraggableFlatList
              key={tabs.map((tab) => tab.tab).join(",")}
              initialNumToRender={tabs.length}
              scrollEnabled={false}
              data={tabs}
              renderItem={({ item, getIndex, drag }) => (
                <ShadowDecorator>
                  <View style={{ backgroundColor: theme.colors.card }}>
                    <NativeItem
                      onLongPress={() => {
                        setLoading(true);
                        drag();
                      }}
                      delayLongPress={50}
                      chevron={false}
                      separator={(getIndex() ?? +Infinity) < tabs.length - 1}
                      leading={
                        <LottieView
                          source={item.icon}
                          colorFilters={[
                            {
                              keypath: "*",
                              color: theme.colors.text,
                            }
                          ]}
                          style={{ width: 24, height: 24, marginVertical: 2 }}
                        />
                      }
                      trailing={
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 9,
                            width: 70,
                          }}
                        >
                          {!safeTabs.includes(item.tab) && !loading && (
                            <Reanimated.View
                              entering={ZoomIn.springify().mass(1).damping(20).stiffness(300)}
                              exiting={ZoomOut.duration(300)}
                            >
                              <PapillonCheckbox
                                checked={item.enabled}
                                onPress={() => {
                                  if (!item.enabled && tabs.filter(t => t.enabled).length === 5) {
                                    showAlert({
                                      title: "Information",
                                      message: "Tu ne peux pas ajouter plus de 5 onglets sur la page d'accueil.",
                                      icon: <BadgeInfo />,
                                      actions: [
                                        {
                                          title: "OK",
                                          primary: true,
                                          icon: <Undo2 />,
                                        },
                                      ],
                                    });
                                  }
                                  toggleTab(item.tab);
                                }}
                              />
                            </Reanimated.View>
                          )}

                          <Equal
                            size={24}
                            color={theme.colors.text}
                            style={{ marginRight: 6, opacity: 0.6 }}
                          />
                        </View>
                      }
                    >
                      <NativeText variant="title">
                        {item.label}
                      </NativeText>
                    </NativeItem>
                  </View>
                </ShadowDecorator>
              )}
              keyExtractor={(item) => item.tab}
              onDragEnd={({ data }) => {
                setTabs(data);
                updatePersonalizationTabs(data);
              }}
            />
          </NativeList>

          <NativeListHeader label="Options" />

          <NativeList>
            <NativeItem onPress={resetTabs}>
              <NativeText
                style={{
                  fontSize: 16,
                  fontFamily: "semibold",
                  color: theme.colors.text,
                }}
              >
                Réinitialiser les onglets
              </NativeText>
              <NativeText
                style={{
                  fontSize: 14,
                  color: theme.colors.text + "90",
                }}
              >
                Réinitialiser les onglets par défaut
              </NativeText>
            </NativeItem>

            <NativeItem
              separator
              icon={<Captions />}
              trailing={
                <Switch
                  value={!hideTabTitles}
                  onValueChange={() => {
                    setHideTabTitles(!hideTabTitles);
                  }}
                />
              }
            >
              <NativeText
                style={{
                  fontSize: 16,
                  fontFamily: "semibold",
                  color: theme.colors.text,
                }}
              >
                Afficher les titres des onglets
              </NativeText>
            </NativeItem>
            <NativeItem
              icon={<SendToBack />}
              trailing={
                <Switch
                  value={showTabBackground}
                  onValueChange={() => {
                    setShowTabBackground(!showTabBackground);
                  }}
                />
              }
            >
              <NativeText
                style={{
                  fontSize: 16,
                  fontFamily: "semibold",
                  color: theme.colors.text,
                }}
              >
                Afficher un fond aux onglets
              </NativeText>
            </NativeItem>
          </NativeList>
        </View>
      </NestableScrollContainer>
    </View>
  );
};

export default SettingsTabs;