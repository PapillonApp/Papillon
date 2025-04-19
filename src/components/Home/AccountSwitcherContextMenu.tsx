import React, { useEffect, useState, useCallback, memo } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
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

interface ContextMenu {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  transparent?: boolean;
  shouldOpenContextMenu?: boolean;
  menuStyles?: StyleProp<ViewStyle>;
}

const ContextMenu: React.FC<ContextMenu> = ({
  style,
  children,
  transparent,
  shouldOpenContextMenu,
  menuStyles,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const navigation = useNavigation();
  const { playHaptics } = useSoundHapticsWrapper();

  const [opened, setOpened] = useState(false);
  const [touchLongPress, setTouchLongPress] = useState(false);

  const currentAccount = useCurrentAccount((store) => store.account!);
  const switchTo = useCurrentAccount((store) => store.switchTo);
  const accounts = useAccounts((store) => store.accounts);

  useEffect(() => {
    if (shouldOpenContextMenu) {
      setOpened(true);
    }
  }, [shouldOpenContextMenu]);

  useEffect(() => {
    setTouchLongPress(false);
  }, [opened]);

  const openEffects = useCallback(() => {
    playHaptics("impact", {
      impact: Haptics.ImpactFeedbackStyle.Light,
    });
  }, [playHaptics]);

  const handlePress = useCallback(() => {
    setOpened((prevOpened) => !prevOpened);
    openEffects();
  }, [openEffects]);

  const handleLongPress = useCallback(() => {
    setTouchLongPress(true);
  }, []);

  const handlePressOut = useCallback(() => {
    if (touchLongPress) {
      setOpened(false);
      openEffects();
    }
  }, [touchLongPress, openEffects]);

  const renderMenuItems = useCallback(() => {
    return accounts.map((account, index) => !account.isExternal && (
      <Pressable
        key={index}
        onPress={() => {
          playHaptics("impact", {
            impact: Haptics.ImpactFeedbackStyle.Soft,
          });
          setOpened(false);
          requestAnimationFrame(() => {
            switchTo(account);
          });
        }}
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : colors.card,
          },
        ]}
      >
        <View
          style={{
            backgroundColor: theme.dark ? theme.colors.primary + "09" : theme.colors.primary + "11",
            flexDirection: "row",
            padding: 9,
            borderStyle: "solid",
            borderBottomWidth: index !== accounts.length - 1 ? 1 : 0,
            borderColor: theme.colors.text + "20",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 80,
              backgroundColor: "#000000",
              marginRight: 10,
            }}
          >
            <Image
              source={account.personalization.profilePictureB64 ? { uri: account.personalization.profilePictureB64 } : defaultProfilePicture(account.service, account.identityProvider?.name || "")}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 80,
              }}
              resizeMode="cover"
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              gap: 2,
            }}
          >
            <View style={{ flexDirection: "row", flexWrap: "nowrap", minWidth: "90%", maxWidth: "75%" }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "semibold",
                  color: colors.text,
                  flexShrink: 1,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {account.studentName?.first || "Utilisateur"} {account.studentName?.last || ""}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: colors.text + "50",
                fontFamily: "medium",
                maxWidth: "70%",
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {AccountService[account.service] !== "Local" && account.service !== AccountService.PapillonMultiService
                ? AccountService[account.service]
                : account.identityProvider
                  ? account.identityProvider.name
                  : "Compte local"}
            </Text>
          </View>
          {currentAccount.localID === account.localID && accounts.length > 1 && (
            <Reanimated.View
              style={{
                position: "absolute",
                right: 15,
              }}
            >
              <Check
                size={22}
                strokeWidth={3.0}
                color={colors.primary}
              />
            </Reanimated.View>
          )}
        </View>
      </Pressable>
    ));
  }, [accounts, colors, currentAccount.localID, playHaptics, switchTo, theme]);

  return (
    <>
      <View
        style={[
          {
            zIndex: 100000,
            gap: 10,
          },
          style,
        ]}
      >
        {Platform.OS === "ios" ? (
          <TouchableOpacity
            onPressIn={handlePress}
            onLongPress={handleLongPress}
            onPressOut={handlePressOut}
            // @ts-ignore
            pointerEvents="auto"
            style={{
              elevation: opened ? 3 : 0,
            }}
          >
            {React.cloneElement(children as React.ReactElement, {
              opened,
            })}
          </TouchableOpacity>
        ) : (
          <TouchableNativeFeedback
            onPress={handlePress}
            useForeground={true}
            style={{
              overflow: "hidden",
            }}
          >
            <View
              style={{
                elevation: opened ? 3 : 0,
                alignSelf: "flex-start",
              }}
              pointerEvents="auto"
            >
              {React.cloneElement(children as React.ReactElement, {
                opened,
              })}
            </View>
          </TouchableNativeFeedback>
        )}

        {opened && (
          <Reanimated.View
            style={[
              {
                backgroundColor: colors.card,
                transformOrigin: "top left",
              },
              styles.menu,
              menuStyles,
            ]}
            entering={PapillonContextEnter}
            exiting={PapillonContextExit}
          >
            <View
              style={{
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {renderMenuItems()}
              <Pressable
                onPress={() => {
                  setOpened(false);
                  // @ts-ignore
                  navigation.navigate("ServiceSelector");
                }}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : colors.card,
                  },
                ]}
              >
                <View
                  style={{
                    backgroundColor: theme.dark ? theme.colors.primary + "09" : theme.colors.primary + "11",
                    flexDirection: "row",
                    padding: 9,
                    borderStyle: "solid",
                    borderTopWidth: 6,
                    borderBottomColor: colors.border,
                    borderColor: theme.dark ? "#ffffff20" : "#00000020",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Plus
                    size={24}
                    color={colors.text}
                    style={{
                      opacity: 0.8,
                      marginHorizontal: 3,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: colors.text + "80",
                      fontFamily: "medium",
                    }}
                  >
                    Ajouter un compte
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => {
                  setOpened(false);
                  setTimeout(() => {
                    // @ts-ignore
                    navigation.navigate("CustomizeHeader");
                  }, 1);
                }}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : colors.card,
                  },
                ]}
              >
                <View
                  style={{
                    backgroundColor: theme.dark ? theme.colors.primary + "09" : theme.colors.primary + "11",
                    flexDirection: "row",
                    padding: 9,
                    borderStyle: "solid",
                    borderTopWidth: 6,
                    borderBottomColor: colors.border,
                    borderColor: theme.dark ? "#ffffff20" : "#00000020",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Palette
                    size={22}
                    color={colors.text}
                    style={{
                      opacity: 0.8,
                      marginHorizontal: 3+1,
                      marginVertical: 1,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: colors.text + "80",
                      fontFamily: "medium",
                    }}
                  >
                    Personnaliser
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => {
                  setOpened(false);
                  // @ts-ignore
                  navigation.navigate("SettingStack");
                }}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : colors.card,
                  },
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    padding: 9,
                    backgroundColor: theme.dark ? theme.colors.primary + "09" : theme.colors.primary + "11",
                    borderStyle: "solid",
                    borderTopWidth: 1,
                    borderBottomColor: colors.border,
                    borderColor: theme.dark ? "#ffffff20" : "#00000020",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Cog
                    size={24}
                    color={colors.text}
                    style={{
                      opacity: 1,
                      marginHorizontal: 3,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: colors.text + "ff",
                      fontFamily: "semibold",
                    }}
                  >
                    Paramètres
                  </Text>
                </View>
              </Pressable>
            </View>
          </Reanimated.View>
        )}
      </View>

      {!transparent && opened && (
        <Pressable
          pointerEvents={opened ? "auto" : "none"}
          style={[
            styles.container,
            {
              width: Dimensions.get("window").width,
              height: Dimensions.get("window").height,
              overflow: "hidden",
            },
          ]}
          onPress={() => {
            setOpened(false);
          }}
        >
          {opened && (
            <Reanimated.View
              pointerEvents="none"
              style={[
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
              ]}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
            >
              <BlurView
                tint="dark"
                intensity={60}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </Reanimated.View>
          )}
        </Pressable>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
