import React, { useEffect, useState, useCallback, memo } from "react";
import { Dimensions, Image, Platform, Pressable, StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View, } from "react-native";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import { PapillonContextEnter, PapillonContextExit } from "@/utils/ui/animations";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { BlurView } from "expo-blur";
import { Check, Cog, Palette, Plus } from "lucide-react-native";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
var ContextMenu = function (_a) {
    var style = _a.style, children = _a.children, transparent = _a.transparent, shouldOpenContextMenu = _a.shouldOpenContextMenu, menuStyles = _a.menuStyles;
    var theme = useTheme();
    var colors = theme.colors;
    var navigation = useNavigation();
    var playHaptics = useSoundHapticsWrapper().playHaptics;
    var _b = useState(false), opened = _b[0], setOpened = _b[1];
    var _c = useState(false), touchLongPress = _c[0], setTouchLongPress = _c[1];
    var currentAccount = useCurrentAccount(function (store) { return store.account; });
    var switchTo = useCurrentAccount(function (store) { return store.switchTo; });
    var accounts = useAccounts(function (store) { return store.accounts; });
    useEffect(function () {
        if (shouldOpenContextMenu) {
            setOpened(true);
        }
    }, [shouldOpenContextMenu]);
    useEffect(function () {
        setTouchLongPress(false);
    }, [opened]);
    var openEffects = useCallback(function () {
        playHaptics("impact", {
            impact: Haptics.ImpactFeedbackStyle.Light,
        });
    }, [playHaptics]);
    var handlePress = useCallback(function () {
        setOpened(function (prevOpened) { return !prevOpened; });
        openEffects();
    }, [openEffects]);
    var handleLongPress = useCallback(function () {
        setTouchLongPress(true);
    }, []);
    var handlePressOut = useCallback(function () {
        if (touchLongPress) {
            setOpened(false);
            openEffects();
        }
    }, [touchLongPress, openEffects]);
    var renderMenuItems = useCallback(function () {
        return accounts.map(function (account, index) {
            var _a, _b, _c;
            return !account.isExternal && (<Pressable key={index} onPress={function () {
                    playHaptics("impact", {
                        impact: Haptics.ImpactFeedbackStyle.Soft,
                    });
                    setOpened(false);
                    requestAnimationFrame(function () {
                        switchTo(account);
                    });
                }} style={function (_a) {
                    var pressed = _a.pressed;
                    return [
                        {
                            backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : colors.card,
                        },
                    ];
                }}>
        <View style={{
                    backgroundColor: theme.dark ? theme.colors.primary + "09" : theme.colors.primary + "11",
                    flexDirection: "row",
                    padding: 9,
                    borderStyle: "solid",
                    borderBottomWidth: index !== accounts.length - 1 ? 1 : 0,
                    borderColor: theme.colors.text + "20",
                    alignItems: "center",
                }}>
          <View style={{
                    width: 30,
                    height: 30,
                    borderRadius: 80,
                    backgroundColor: "#000000",
                    marginRight: 10,
                }}>
            <Image source={account.personalization.profilePictureB64 ? { uri: account.personalization.profilePictureB64 } : defaultProfilePicture(account.service, ((_a = account.identityProvider) === null || _a === void 0 ? void 0 : _a.name) || "")} style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 80,
                }} resizeMode="cover"/>
          </View>
          <View style={{
                    flexDirection: "column",
                    gap: 2,
                }}>
            <View style={{ flexDirection: "row", flexWrap: "nowrap", minWidth: "90%", maxWidth: "75%" }}>
              <Text style={{
                    fontSize: 16,
                    fontFamily: "semibold",
                    color: colors.text,
                    flexShrink: 1,
                }} numberOfLines={1} ellipsizeMode="tail">
                {((_b = account.studentName) === null || _b === void 0 ? void 0 : _b.first) || "Utilisateur"} {((_c = account.studentName) === null || _c === void 0 ? void 0 : _c.last) || ""}
              </Text>
            </View>
            <Text style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: colors.text + "50",
                    fontFamily: "medium",
                    maxWidth: "70%",
                }} numberOfLines={1} ellipsizeMode="tail">
              {AccountService[account.service] !== "Local" && account.service !== AccountService.PapillonMultiService
                    ? AccountService[account.service]
                    : account.identityProvider
                        ? account.identityProvider.name
                        : "Compte local"}
            </Text>
          </View>
          {currentAccount.localID === account.localID && accounts.length > 1 && (<Reanimated.View style={{
                        position: "absolute",
                        right: 15,
                    }}>
              <Check size={22} strokeWidth={3.0} color={colors.primary}/>
            </Reanimated.View>)}
        </View>
      </Pressable>);
        });
    }, [accounts, colors, currentAccount.localID, playHaptics, switchTo, theme]);
    return (<>
      <View style={[
            {
                zIndex: 100000,
                gap: 10,
            },
            style,
        ]}>
        {Platform.OS === "ios" ? (<TouchableOpacity onPressIn={handlePress} onLongPress={handleLongPress} onPressOut={handlePressOut} 
        // @ts-ignore
        pointerEvents="auto" style={{
                elevation: opened ? 3 : 0,
            }}>
            {React.cloneElement(children, {
                opened: opened,
            })}
          </TouchableOpacity>) : (<TouchableNativeFeedback onPress={handlePress} useForeground={true} style={{
                overflow: "hidden",
            }}>
            <View style={{
                elevation: opened ? 3 : 0,
                alignSelf: "flex-start",
            }} pointerEvents="auto">
              {React.cloneElement(children, {
                opened: opened,
            })}
            </View>
          </TouchableNativeFeedback>)}

        {opened && (<Reanimated.View style={[
                {
                    backgroundColor: colors.card,
                    transformOrigin: "top left",
                },
                styles.menu,
                menuStyles,
            ]} entering={PapillonContextEnter} exiting={PapillonContextExit}>
            <View style={{
                borderRadius: 12,
                overflow: "hidden",
            }}>
              {renderMenuItems()}
              <Pressable onPress={function () {
                setOpened(false);
                // @ts-ignore
                navigation.navigate("ServiceSelector");
            }} style={function (_a) {
                var pressed = _a.pressed;
                return [
                    {
                        backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : colors.card,
                    },
                ];
            }}>
                <View style={{
                backgroundColor: theme.dark ? theme.colors.primary + "09" : theme.colors.primary + "11",
                flexDirection: "row",
                padding: 9,
                borderStyle: "solid",
                borderTopWidth: 6,
                borderBottomColor: colors.border,
                borderColor: theme.dark ? "#ffffff20" : "#00000020",
                alignItems: "center",
                gap: 10,
            }}>
                  <Plus size={24} color={colors.text} style={{
                opacity: 0.8,
                marginHorizontal: 3,
            }}/>
                  <Text style={{
                fontSize: 16,
                fontWeight: 600,
                color: colors.text + "80",
                fontFamily: "medium",
            }}>
                    Ajouter un compte
                  </Text>
                </View>
              </Pressable>
              <Pressable onPress={function () {
                setOpened(false);
                setTimeout(function () {
                    // @ts-ignore
                    navigation.navigate("CustomizeHeader");
                }, 1);
            }} style={function (_a) {
                var pressed = _a.pressed;
                return [
                    {
                        backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : colors.card,
                    },
                ];
            }}>
                <View style={{
                backgroundColor: theme.dark ? theme.colors.primary + "09" : theme.colors.primary + "11",
                flexDirection: "row",
                padding: 9,
                borderStyle: "solid",
                borderTopWidth: 6,
                borderBottomColor: colors.border,
                borderColor: theme.dark ? "#ffffff20" : "#00000020",
                alignItems: "center",
                gap: 10,
            }}>
                  <Palette size={22} color={colors.text} style={{
                opacity: 0.8,
                marginHorizontal: 3 + 1,
                marginVertical: 1,
            }}/>
                  <Text style={{
                fontSize: 16,
                fontWeight: 600,
                color: colors.text + "80",
                fontFamily: "medium",
            }}>
                    Personnaliser
                  </Text>
                </View>
              </Pressable>
              <Pressable onPress={function () {
                setOpened(false);
                // @ts-ignore
                navigation.navigate("SettingStack");
            }} style={function (_a) {
                var pressed = _a.pressed;
                return [
                    {
                        backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : colors.card,
                    },
                ];
            }}>
                <View style={{
                flexDirection: "row",
                padding: 9,
                backgroundColor: theme.dark ? theme.colors.primary + "09" : theme.colors.primary + "11",
                borderStyle: "solid",
                borderTopWidth: 1,
                borderBottomColor: colors.border,
                borderColor: theme.dark ? "#ffffff20" : "#00000020",
                alignItems: "center",
                gap: 10,
            }}>
                  <Cog size={24} color={colors.text} style={{
                opacity: 1,
                marginHorizontal: 3,
            }}/>
                  <Text style={{
                fontSize: 16,
                fontWeight: 600,
                color: colors.text + "ff",
                fontFamily: "semibold",
            }}>
                    Paramètres
                  </Text>
                </View>
              </Pressable>
            </View>
          </Reanimated.View>)}
      </View>

      {!transparent && opened && (<Pressable pointerEvents={opened ? "auto" : "none"} style={[
                styles.container,
                {
                    width: Dimensions.get("window").width,
                    height: Dimensions.get("window").height,
                    overflow: "hidden",
                },
            ]} onPress={function () {
                setOpened(false);
            }}>
          {opened && (<Reanimated.View pointerEvents="none" style={[
                    {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#00000050",
                    },
                ]} entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
              <BlurView tint="dark" intensity={60} style={{
                    width: "100%",
                    height: "100%",
                }}/>
            </Reanimated.View>)}
        </Pressable>)}
    </>);
};
var styles = StyleSheet.create({
    container: {
        zIndex: 100,
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    menu: {
        width: 260,
        borderRadius: 12,
        borderCurve: "continuous",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 6,
    },
});
export default memo(ContextMenu);
