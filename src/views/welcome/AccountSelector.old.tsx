import {NativeItem, NativeList, NativeListHeader, NativeText} from "@/components/Global/NativeComponents";
import {useAccounts, useCurrentAccount} from "@/stores/account";
import {defaultProfilePicture} from "@/utils/ui/default-profile-picture";
import {useIsFocused, useTheme} from "@react-navigation/native";
import {BadgeHelp, PlusIcon, Trash2, Undo2} from "lucide-react-native";
import {useEffect, useState} from "react";
import {
  Dimensions,
  Image,
  RefreshControl,
  StatusBar,
  Text,
  TouchableHighlight,
  View
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";

import PapillonAvatar from "@/components/Global/PapillonAvatar";

import PackageJSON from "@/../package.json";

import Reanimated, {
  Extrapolation,
  FadeInDown,
  FadeOut,
  interpolate,
  LinearTransition,
  useAnimatedRef, useAnimatedStyle,
  useScrollViewOffset,
  ZoomIn,
} from "react-native-reanimated";
import {LinearGradient} from "expo-linear-gradient";
import {animPapillon} from "@/utils/ui/animations";
import {Screen} from "@/router/helpers/types";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import {PressableScale} from "react-native-pressable-scale";

import datasets from "@/consts/datasets.json";
import Animated from "react-native-reanimated";
import {PrimaryAccount} from "@/stores/account/types";
import { useAlert } from "@/providers/AlertProvider";


// https://raw.githubusercontent.com/PapillonApp/datasets/refs/heads/main/illustrations/index.json
type Illustration = {
  name: string
  image: string
};

const AccountSelector: Screen<"AccountSelector"> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const isFocused = useIsFocused();

  const currentAccount = useCurrentAccount((store) => store.account);
  const switchTo = useCurrentAccount((store) => store.switchTo);
  const removeAccount = useAccounts((store) => store.remove);

  const lastOpenedAccountID = useAccounts((store) => store.lastOpenedAccountID);
  const accounts = useAccounts((store) => store.accounts);

  const [loading, setLoading] = useState<string | null>(null);

  const [downloadedIllustrations, setDownloadedIllustrations] = useState(false);
  const [illustration, setIllustration] = useState<undefined | Illustration>(undefined);
  const [illustrationLoaded, setIllustrationLoaded] = useState(false);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const headerRatioHeight = 250;
  let headerAnimatedStyle = useAnimatedStyle(() => ({
    top: interpolate(
      scrollOffset.value,
      [headerRatioHeight - 1000, 0, headerRatioHeight - (insets.top + 64), headerRatioHeight + 1000],
      [headerRatioHeight - 1000, 0, 0, headerRatioHeight + 1000 - (insets.top + 64)],
      Extrapolation.CLAMP
    ),
  }));
  let headerOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollOffset.value, [0, 100], [0, 0.75], Extrapolation.CLAMP),
  }));

  const { showAlert } = useAlert();

  useEffect(() => {
    if(!downloadedIllustrations) {
      updateIllustration();
    }
  }, []);

  const updateIllustration = async () => {
    fetch(datasets["illustrations"])
      .then((response) => response.json())
      .then((data) => {
        setDownloadedIllustrations(true);
        // select a random illustration
        setIllustration(data[Math.floor(Math.random() * data.length)]);
      });
  };

  useEffect(() => {
    void async function () {
      if (!useAccounts.persist.hasHydrated()) return;

      // If there are no accounts, redirect the user to the first installation page.
      if (accounts.filter((account) => !account.isExternal).length === 0) {
        // Use the `reset` method to clear the navigation stack.
        navigation.reset({
          index: 0,
          routes: [{ name: "FirstInstallation" }],
        });
      }
      else {
        const selectedAccount =
          accounts.find((account) => account.localID === lastOpenedAccountID) as PrimaryAccount
          ?? accounts.find((account) => !account.isExternal) as PrimaryAccount;
        switchTo(selectedAccount);
      }
    }();
  }, [accounts]);

  useEffect(() => {
    if (currentAccount && currentAccount?.localID) {
      navigation.reset({
        index: 0,
        routes: [{ name: "AccountStack" }],
      });

      SplashScreen.hideAsync();
    }
  }, [currentAccount]);

  if (!accounts) return null;

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          position: "absolute",
          zIndex: 99999999,
          bottom: 0,
          left: 0,
          right: 0,
          height: 70 + insets.bottom,
          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        }}
      >
        <LinearGradient
          colors={[theme.colors.background + "00", theme.colors.background]}
          locations={[0, (insets.bottom) / 70]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 70 + insets.bottom,
            zIndex: 5,
          }}
        />
        <PressableScale
          style={{
            zIndex: 99999999,
            position: "absolute",
            right: 20,
            bottom: 16 + insets.bottom,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 10,
            borderRadius: 100,
            backgroundColor: theme.colors.primary,
          }}
          onPress={() => navigation.navigate("ServiceSelector")}
        >
          <PlusIcon
            size={24}
            strokeWidth={2.5}
            color={"#fff"}
          />

          <Text
            style={{
              color: "#ffffff",
              fontFamily: "semibold",
              fontSize: 16,
            }}
          >
            Ajouter un compte
          </Text>
        </PressableScale>

        <TouchableHighlight
          style={{
            position: "absolute",
            bottom: 16 + insets.bottom,
            left: 16,
            alignSelf: "flex-start",
            opacity: 0.4,
            zIndex: 99999999,
            paddingHorizontal: 8,
            marginHorizontal: -8,
            paddingVertical: 4,
            borderRadius: 5,
          }}
          underlayColor={theme.colors.text + "44"}
          onLongPress={() => navigation.navigate("DevMenu")}
          delayLongPress={2000}
        >
          <NativeText
            style={{
              fontSize: 12,
            }}
          >
            ver. {PackageJSON.version}
          </NativeText>
        </TouchableHighlight>
      </View>

      <Reanimated.ScrollView
        style={{
          paddingBottom: insets.bottom + 16,
          paddingTop: 0,
          flex: 1
        }}
        ref={scrollRef}
        scrollEventThrottle={8}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              updateIllustration();
            }}
            progressViewOffset={headerRatioHeight}
          />
        }
        contentContainerStyle={{
          minHeight: Dimensions.get("window").height,
        }}
      >
        {isFocused && (
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />
        )}

        <Reanimated.View
          style={[{
            width: "100%",
            zIndex: 2,
            borderBottomColor: theme.colors.border,
            borderBottomWidth: 1,
            height: headerRatioHeight,
          }, headerAnimatedStyle]}
        >
          {!illustrationLoaded &&
          <Reanimated.View
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              backgroundColor: "#1E212D",
              zIndex: 3,
            }}
            exiting={FadeOut}
          />
          }

          <Reanimated.Image
            source={illustration && { uri: illustration.image }}
            style={{
              width: "100%",
              height: "100%",
            }}
            onLoad={() => setIllustrationLoaded(true)}
          />
          <Reanimated.View style={[{
            backgroundColor: "#000",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }, headerOpacity]}
          />

          <LinearGradient
            colors={["#00000000", "#000000"]}
            locations={[0.5, 0.8]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "0%",
              height: "100%",
              opacity: 0.85,
              zIndex: 5
            }}
          />

          <View
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 16,
              gap: 4,
              zIndex: 9
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 18,
                fontFamily: "bold",
              }}
            >
              Bienvenue sur Papillon !
            </Text>

            <Text
              style={{
                color: "#ffffff",
                fontSize: 15,
                fontFamily: "medium",
                opacity: 0.8,
              }}
            >
              Sélectionne un compte pour commencer.
            </Text>
          </View>
        </Reanimated.View>

        {accounts.filter((account) => !account.isExternal).length > 0 && (
          <Reanimated.View
            entering={animPapillon(FadeInDown)}
            layout={animPapillon(LinearTransition)}
            style={{paddingHorizontal: 16}}
          >
            <NativeListHeader label="Comptes connectés" />
            <NativeList>
              {accounts.map((account, index) => {
                return !account.isExternal && (
                  <NativeItem
                    key={index}
                    leading={
                      <PapillonAvatar
                        source={account.personalization.profilePictureB64 ? { uri: account.personalization.profilePictureB64 } : defaultProfilePicture(account.service, account.identityProvider?.name || "")}
                        badgeOffset={4}
                        badge={
                          <Image
                            source={defaultProfilePicture(account.service, account.identityProvider?.name || "")}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 12,
                              borderColor: theme.colors.card,
                              borderWidth: 2,
                            }}
                          />
                        }
                      />
                    }
                    trailing={
                      loading === account.localID && (
                        <PapillonSpinner
                          size={24}
                          strokeWidth={3.5}
                          color={theme.colors.primary}
                          animated
                          entering={animPapillon(ZoomIn)}
                        />
                      )
                    }
                    onLongPress={async () => {
                      // delete account
                      showAlert({
                        title: "Supprimer le compte",
                        message: "Es-tu sûr de vouloir supprimer ce compte ?",
                        icon: <BadgeHelp />,
                        actions: [
                          {
                            title: "Annuler",
                            icon: <Undo2 />,
                            primary: true,
                          },
                          {
                            title: "Supprimer",
                            icon: <Trash2 />,
                            onPress: () => {
                              // setTimeout pour laisser le temps à la précédente alerte de s'enlever
                              setTimeout(() => {
                                showAlert({
                                  title: "Es-tu sûr ?",
                                  message: `Veux-tu supprimer définitivement ${account.studentName.first} ${account.studentName.last} ?`,
                                  icon: <BadgeHelp />,
                                  actions: [
                                    {
                                      title: "Annuler",
                                      icon: <Undo2 />,
                                      primary: false,
                                    },
                                    {
                                      title: "Supprimer",
                                      icon: <Trash2 />,
                                      onPress: () => removeAccount(account.localID),
                                      danger: true,
                                      delayDisable: 5,
                                    }
                                  ]
                                });
                              }, 500);
                            },
                            danger: true,
                          }
                        ]
                      });
                    }}
                    onPress={async () => {
                      if (currentAccount?.localID !== account.localID) {
                        setLoading(account.localID);
                        await switchTo(account);
                        setLoading(null);
                      }

                      navigation.reset({
                        index: 0,
                        routes: [{ name: "AccountStack" }],
                      });
                    }}
                  >
                    <Reanimated.View
                      style={{
                        flex: 1,
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 3,
                      }}
                      layout={animPapillon(LinearTransition)}
                    >
                      <NativeText animated variant="title" numberOfLines={1}>
                        {account.studentName.first} {account.studentName.last}
                      </NativeText>
                      <NativeText animated variant="subtitle" numberOfLines={1}>
                        {account.schoolName ?
                          account.schoolName :
                          account.identityProvider ?
                            account.identityProvider.name :
                            "Compte local"
                        }
                      </NativeText>
                    </Reanimated.View>
                  </NativeItem>
                );
              })}
            </NativeList>
          </Reanimated.View>
        )}

        <View
          style={{
            height: 100,
          }}
        />
      </Reanimated.ScrollView>
    </View>
  );
};

export default AccountSelector;
