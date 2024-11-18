import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from "react-native";

import Reanimated, {
  FadeIn,
  FadeOut
} from "react-native-reanimated";

import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import { PapillonContextEnter, PapillonContextExit } from "@/utils/ui/animations";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import { useTheme } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { Check, CirclePlus, Cog } from "lucide-react-native";

const ContextMenu: React.FC<{
  style?: any;
  children: React.ReactNode;
  shouldOpenContextMenu?: boolean
}> = ({ children, style, shouldOpenContextMenu }) => {
  const theme = useTheme();
  const { colors } = theme;
  const navigation = useNavigation();

  const [opened, setOpened] = useState(false); // État pour gérer l'ouverture du menu contextuel

  const currentAccount = useCurrentAccount((store) => store.account!);
  const switchTo = useCurrentAccount((store) => store.switchTo);

  const accounts = useAccounts((store) => store.accounts);

  // Effet pour ouvrir le menu contextuel si shouldOpenContextMenu change
  useEffect(() => {
    if (shouldOpenContextMenu) {
      setOpened(true);
    }
  }, [shouldOpenContextMenu]);

  // Fonction pour activer un effet haptique à l'ouverture du menu
  const openEffects = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

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
        {/* Différents comportements pour iOS et Android */}
        {Platform.OS === "ios" ? (
          <TouchableOpacity
            onPress={() => {
              setOpened(!opened);
              openEffects();
            }}
            // @ts-expect-error
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
            onPress={() => {
              setOpened(!opened);
              openEffects();
            }}
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

        {/* Menu contextuel */}
        {opened && (
          <Reanimated.View
            style={[
              {
                backgroundColor: colors.card,
                transformOrigin: "top left",
              },
              styles.menu,
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
              {accounts.map((account, index) => !account.isExternal && (
                <Pressable
                  key={index}
                  onPress={() => {
                    switchTo(account);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    setOpened(false);
                  }}
                  style={({ pressed }) => [
                    {
                      backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : colors.card, // Utilisation de rgba pour l'assombrissement
                    },
                  ]}
                >
                  <View
                    style={{
                      backgroundColor: theme.dark ? theme.colors.primary + "09" : theme.colors.primary + "11",
                      flexDirection: "row",
                      padding: 9,
                      borderStyle: "solid",
                      borderBottomWidth: index !== accounts.length - 1 ? 2 : 0,
                      borderColor: theme.dark ? "#ffffff20" :"#00000020",
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
                            flexShrink: 1
                          }}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {account.studentName?.first || "Utilisateur"}{" "}
                          {account.studentName?.last || ""}
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
                        {AccountService[account.service] !== "Local" ?
                          AccountService[account.service] :
                          account.identityProvider ?
                            account.identityProvider.name :
                            "Compte local"
                        }
                      </Text>
                    </View>
                    {currentAccount.localID === account.localID && (
                      <View
                        style={{
                          position: "absolute",
                          right: 15,
                        }}
                      >
                        <Check
                          size={25}
                          color={colors.text}
                        />
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
              <Pressable
                onPress={() => {
                  setOpened(false);
                  // @ts-expect-error : TODO: https://reactnavigation.org/docs/typescript/#specifying-default-types-for-usenavigation-link-ref-etc
                  navigation.navigate("ServiceSelector");
                }}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : colors.card, // Utilisation de rgba pour l'assombrissement
                  },
                ]}
              >
                <View
                  style={{
                    backgroundColor: theme.dark ? theme.colors.primary + "09" : theme.colors.primary + "11",
                    flexDirection: "row",
                    padding: 9,
                    borderStyle: "solid",
                    borderTopWidth: 2,
                    borderBottomColor: colors.border,
                    borderColor: theme.dark ? "#ffffff20" :"#00000020",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <CirclePlus
                    size={26}
                    color={colors.text}
                    style={{
                      opacity: 0.65,
                    }}
                  />

                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: colors.text + "50",
                      fontFamily: "semibold",
                    }}
                  >
                    Ajouter un compte
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => {
                  setOpened(false);
                  // @ts-expect-error : TODO: https://reactnavigation.org/docs/typescript/#specifying-default-types-for-usenavigation-link-ref-etc
                  navigation.navigate("SettingStack");
                }}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : colors.card, // Utilisation de rgba pour l'assombrissement
                  },
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    padding: 9,
                    backgroundColor: theme.dark ? theme.colors.primary + "09" : theme.colors.primary + "11",
                    borderStyle: "solid",
                    borderTopWidth: 6,
                    borderBottomColor: colors.border,
                    borderColor: theme.dark ? "#ffffff20" :"#00000020",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Cog
                    size={26}
                    color={colors.text}
                    opacity={0.65}
                  />

                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: colors.text + "80",
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
                backgroundColor: "#00000050"
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
              experimentalBlurMethod="dimezisBlurView"
            />
          </Reanimated.View>
        )}
      </Pressable>
    </>
  );
};

// Styles utilisés dans le composant
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

export default ContextMenu;
