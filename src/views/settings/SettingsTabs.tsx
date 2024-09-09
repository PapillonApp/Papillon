import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import { useCurrentAccount } from "@/stores/account";
import { useTheme } from "@react-navigation/native";
import { getBackgroundColorAsync } from "expo-navigation-bar";
import LottieView from "lottie-react-native";
import { AlertTriangle, Captions, Equal, SendToBack } from "lucide-react-native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Platform, Switch, View } from "react-native";
import { NestableDraggableFlatList, NestableScrollContainer, ShadowDecorator } from "react-native-draggable-flatlist";
import { PressableScale } from "react-native-pressable-scale";
import Reanimated, { FadeIn, FadeOut, FadeOutRight, LinearTransition, ZoomIn, ZoomOut, ZoomOutRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { defaultTabs } from "@/consts/DefaultTabs";


const SettingsTabs = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount(store => store.account!);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);

  const safeTabs = ["Home"];

  const [tabs, setTabs] = useState(defaultTabs);

  const toggleTab = (tab: string) => {
    void (async () => {
      if (tabs.filter(t => t.enabled).length === 5 && !tabs.find(t => t.tab === tab)?.enabled) {
        playFailAnimation();
        return;
      }

      const newTabs = [...tabs];
      const index = newTabs.findIndex(t => t.tab === tab);

      if (index !== -1 && !safeTabs.includes(tab)) {
        newTabs[index].enabled = !newTabs[index].enabled;
        setTabs(newTabs);
      }
    })();
  };

  useEffect(() => {
    void (async () => {
      const newTabs = [...tabs];
      const homeIndex = newTabs.findIndex(tab => tab.tab === "Home");

      // Ensure Home is among first 5 tabs
      if (homeIndex > 4) {
        const homeTab = newTabs.splice(homeIndex, 1)[0];
        newTabs.splice(4, 0, homeTab);
      }

      if (homeIndex > 4) {
        setTabs(newTabs);
      }
    })();
  }, [tabs]);

  useEffect(() => {
    void (async () => {
      mutateProperty("personalization", {
        ...account.personalization,
        tabs: tabs.map(({ tab, enabled, installed }) => ({ name: tab, enabled, installed })),
      });
    })();
  }, [tabs]);

  const [hideTabTitles, setHideTabTitles] = useState(false);
  const [showTabBackground, setShowTabBackground] = useState(false);

  useEffect(() => {
    void (async () => {
      mutateProperty("personalization", {
        ...account.personalization,
        hideTabTitles : hideTabTitles,
        showTabBackground: showTabBackground,
      });
    })();
  }, [hideTabTitles, showTabBackground]);

  useLayoutEffect(() => {
    void(async () => {
      if (account.personalization.tabs) {
        const new_tabs = account.personalization.tabs.map(personalizationTab => ({
          ...tabs.find(t => t.tab === personalizationTab.name)!,
          enabled: personalizationTab.enabled,
        }));

        setTabs(new_tabs);
      }
      else {
        setTabs(defaultTabs);
        mutateProperty("personalization", {
          ...account.personalization,
          tabs: defaultTabs.map(({ tab, enabled }) => ({ name: tab, enabled })),
        });
      }

      setHideTabTitles(account.personalization.hideTabTitles ?? false);
      setShowTabBackground(account.personalization.showTabBackground ?? false);
    })();
  }, []);

  const [failAnimation, setFailAnimation] = useState(false);

  const playFailAnimation = () => {
    setFailAnimation(true);
    setTimeout(() => setFailAnimation(false), 900);
  };

  const [previewIndex, setPreviewIndex] = useState(0);

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
                {tabs.map((tab, index) => {
                  const lottieRef = useRef<LottieView>(null);

                  if (!tab.enabled) {
                    return null;
                  }

                  return (
                    <Reanimated.View
                      key={tab.tab}
                      style={{
                        flex: 1
                      }}
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
                          gap: 2
                        }}
                        onPress={() => {
                          setPreviewIndex(index);
                          lottieRef.current?.reset();
                          lottieRef.current?.play();
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
                            ref={lottieRef}
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
                Vous pouvez choisir jusqu'à 5 onglets à afficher sur la page d'accueil.
              </NativeText>
            </NativeItem>
          </NativeList>

          <NativeListHeader
            label="Réorganiser les onglets"
          />

          <NativeList>
            <NestableDraggableFlatList
              initialNumToRender={tabs.length}
              scrollEnabled={false}
              data={tabs}
              renderItem={({ item, getIndex, drag }) => (
                <ShadowDecorator>
                  <View
                    style={{
                      backgroundColor: theme.colors.card,
                    }}
                  >
                    <NativeItem
                      onPress={async () => {
                        toggleTab(item.tab);
                      }}
                      onLongPress={drag}
                      delayLongPress={200}
                      chevron={false}
                      separator={(getIndex() ?? +Infinity) < tabs.length - 1}
                      leading={
                        <LottieView
                          source={item.icon}
                          colorFilters={[{
                            keypath: "*",
                            color: theme.colors.text,
                          }]}
                          style={{
                            width: 24,
                            height: 24,
                            marginVertical: 2,
                          }}
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
                          {!safeTabs.includes(item.tab) && (
                            <Reanimated.View
                              entering={ZoomIn.springify().mass(1).damping(20).stiffness(300)}
                              exiting={ZoomOut.duration(300)}
                            >
                              <PapillonCheckbox
                                checked={item.enabled}
                                onPress={() => {
                                  toggleTab(item.tab);
                                }}
                              />
                            </Reanimated.View>
                          )}

                          <Equal
                            size={24}
                            color={theme.colors.text}
                            style={{
                              marginRight: 6,
                              opacity: 0.6
                            }}
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
              onDragEnd={({ data }) => setTabs(data)}
            />
          </NativeList>

          <NativeListHeader
            label="Options"
          />

          <NativeList>
            <NativeItem

              separator
              icon={<Captions />}
              trailing={
                <Switch
                  value={!hideTabTitles}
                  onValueChange={() => setHideTabTitles(!hideTabTitles)}
                />
              }
            >
              <NativeText style={{
                fontSize: 16,
                fontFamily: "semibold",
                color: theme.colors.text,
              }}>
                Afficher les titres des onglets
              </NativeText>
            </NativeItem>
            <NativeItem
              icon={<SendToBack />}
              trailing={
                <Switch
                  value={showTabBackground}
                  onValueChange={() => setShowTabBackground(!showTabBackground)}

                />
              }
            >
              <NativeText style={{
                fontSize: 16,
                fontFamily: "semibold",
                color: theme.colors.text,
              }}>
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