import { Alert, Image, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MenuCard from "../Cards/Card";
import Reanimated from "react-native-reanimated";
import React, { useState } from "react";
import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";

import { differenceInDays, formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import { PressableScale } from "react-native-pressable-scale";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService, ExternalAccount } from "@/stores/account/types";
import { ExternalLink, MoreHorizontal, MoreVertical, QrCode, Trash2 } from "lucide-react-native";
import { balanceFromExternal } from "@/services/balance";
import { reservationHistoryFromExternal } from "@/services/reservation-history";
import { Screen } from "@/router/helpers/types";
import { LinearGradient } from "expo-linear-gradient";
import { formatCardIdentifier } from "@/utils/external/restaurant";
import PapillonHeader, { PapillonHeaderInsetHeight } from "@/components/Global/PapillonHeader";
import PapillonPicker from "@/components/Global/PapillonPicker";
import { PapillonHeaderAction } from "@/components/Global/PapillonModernHeader";

const RestaurantCardDetail: Screen<"RestaurantCardDetail"> = ({ route, navigation }) => {
  try {
    const { card } = route.params;
    const [cardData, setCardData] = useState(null);

    const theme = useTheme();

    const account = useCurrentAccount((store) => store.account);
    const removeAccount = useAccounts((state) => state.remove);

    const cardName = `Carte ${AccountService[route.params.card.service as AccountService]} ${account?.identity?.firstName ? "de " + account.identity.firstName : ""}`;

    React.useLayoutEffect(() => {
      if(Platform.OS === "ios") {
        navigation.setOptions({
          headerTitle: cardName ?? "Détail de la carte",
          headerLargeTitleStyle: {
            color: "transparent",
          },
          headerLargeStyle: {
            backgroundColor: "transparent",
          },
          headerBlurEffect: "regular",
          headerRight: () => (
            <PapillonPicker
              data={[
                ...card.theme.links?.map((link) => ({
                  label: link.label,
                  subtitle: link.subtitle,
                  sfSymbol: link.sfSymbol,
                  icon: <ExternalLink />,
                  onPress: () => Linking.openURL(link.url),
                })) ?? [],
                {
                  label: "Supprimer",
                  icon: <Trash2 />,
                  sfSymbol: "trash",
                  destructive: true,
                  onPress: () => {
                    Alert.alert(
                      "Supprimer la carte",
                      "Veux-tu vraiment supprimer la " + (cardName ?? "carte") + " ?",
                      [
                        { text: "Annuler", style: "cancel" },
                        {
                          text: "Supprimer",
                          style: "destructive",
                          onPress: () => {
                            try {
                              removeAccount(card.account?.localID as string);
                              navigation.goBack();
                            }
                            catch (e) {
                              console.log(e);
                            }
                          }
                        }
                      ]
                    );
                  }
                }
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.5}
              >
                <MoreHorizontal opacity={0.7} size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </PapillonPicker>
          ),
        });
      }
    }, [navigation, theme]);

    const updateCardData = async () => {
      try {
        const [balance, history] = await Promise.all([
          balanceFromExternal(route.params.card.account as ExternalAccount).catch(err => {
            console.warn(`Error fetching balance for account ${account}:`, err);
            return [];
          }),
          reservationHistoryFromExternal(route.params.card.account as ExternalAccount).catch(err => {
            console.warn(`Error fetching history for account ${account}:`, err);
            return [];
          })
        ]);

        setCardData({
          ...card,
          // @ts-expect-error
          balance: balance,
          history: history,
        });
      }
      catch (e) {
        console.log(e);
      }
    };

    React.useEffect(() => {
    // on focus
      const unsubscribe = navigation.addListener("focus", () => {
        updateCardData();
      });

      return unsubscribe;
    }, []);

    return (
      <>
        {Platform.OS === "android" && (
          <PapillonHeader route={route} navigation={navigation} title={cardName ?? "Détail de la carte"}>
            <PapillonPicker
              animated
              direction="right"
              delay={0}
              data={[
                ...card.theme.links?.map((link) => ({
                  label: link.label,
                  subtitle: link.subtitle,
                  sfSymbol: link.sfSymbol,
                  icon: <ExternalLink />,
                  onPress: () => Linking.openURL(link.url),
                })) ?? [],
                {
                  label: "Supprimer",
                  icon: <Trash2 />,
                  sfSymbol: "trash",
                  destructive: true,
                  onPress: () => {
                    Alert.alert(
                      "Supprimer la carte",
                      "Veux-tu vraiment supprimer la " + (cardName ?? "carte") + " ?",
                      [
                        { text: "Annuler", style: "cancel" },
                        {
                          text: "Supprimer",
                          style: "destructive",
                          onPress: () => {
                            try {
                              removeAccount(card.account?.localID as string);
                              navigation.goBack();
                            }
                            catch (e) {
                              console.log(e);
                            }
                          }
                        }
                      ]
                    );
                  }
                }
              ]}
            >
              <PapillonHeaderAction
                icon={<MoreVertical />}
              />
            </PapillonPicker>
          </PapillonHeader>
        )}
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            padding: 16,
          }}
        >
          <PapillonHeaderInsetHeight route={route} />
          <PressableScale
            weight="light"
            activeScale={0.95}
            style={[
              Platform.OS === "ios" ? {
                marginTop: -76,
              } : null
            ]}
          >
            <Reanimated.View
              style={{
                transform: [
                  { scale: 0.85 },
                ],
                marginVertical: 4,
              }}
              pointerEvents={"none"}
            >
              <MenuCard card={route.params.card} />
            </Reanimated.View>
          </PressableScale>

          <View
            style={{
              gap: 3,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "bold",
                  textAlign: "center",
                  color: theme.colors.text,
                }}
              >
                {cardName}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 15,
                fontFamily: "medium",
                opacity: 0.5,
                textAlign: "center",
                color: theme.colors.text,
                letterSpacing: 3.5,
              }}
            >
              {formatCardIdentifier(card.account?.localID as string, 12, "")}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
            }}
          >
            {card?.balance[0] && (
              <NativeList inline style={{ flex: 1, height: 76 }}>
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 76,
                  }}
                >
                  <NativeText
                    variant="subtitle"
                    style={{
                      textAlign: "center",
                    }}
                  >
                    Solde de la carte
                  </NativeText>
                  <Text
                    style={{
                      fontFamily: "semibold",
                      fontSize: 28,
                      textAlign: "center",
                      color: card.balance[0].amount > 0 ? "#00C853" : "#FF1744",
                    }}
                  >
                    {card.balance[0].amount > 0 && "+"}{card.balance[0].amount.toFixed(2)} €
                  </Text>
                </View>
              </NativeList>
            )}

            {card?.cardnumber && (
              <PressableScale
                onPress={() => navigation.navigate("RestaurantQrCode", { card: card })}
                weight="light"
                activeScale={0.95}
              >
                <NativeList inline style={{ width: 120, height: 76 }}>
                  <View
                    style={{
                      height: 76,
                      gap: 6,
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: route.params.card.theme.colors.background ?? theme.colors.primary,
                    }}
                  >
                    <QrCode
                      size={24}
                      strokeWidth={2.2}
                      color={"#fff"}
                    />
                    <Text
                      style={{
                        fontFamily: "semibold",
                        fontSize: 13,
                        color: "#fff",
                        textAlign: "center",
                      }}
                    >
                      Payer un repas
                    </Text>
                  </View>
                </NativeList>
              </PressableScale>
            )}
          </View>

          {card?.balance[0] &&
           card?.balance[0].remaining !== null &&
           card?.balance[0].remaining !== Infinity &&
            (
              <NativeList inline>
                <NativeItem
                  trailing={
                    <NativeText
                      variant="titleLarge"
                      style={{
                        marginRight: 10,
                        fontFamily: "semibold",
                        fontSize: 26,
                        lineHeight: 28,
                        color: card.balance[0].remaining > 1 ? "#00C853" : "#FF1744",
                      }}
                    >
                      {card.balance[0].remaining.toFixed(0)}
                    </NativeText>
                  }
                >
                  <NativeText variant="title">
                    Repas restants
                  </NativeText>
                  <NativeText variant="subtitle">
                    Tarif estimé à {card.balance[0].price?.toFixed(2)} €
                  </NativeText>
                </NativeItem>
              </NativeList>
            )
          }

          {card?.history.length > 0 && (
            <NativeList inline>
              {card.history
                .filter((event) => !isNaN(new Date(event.timestamp).getTime()))
                .sort((a: any, b: any) => b.timestamp - a.timestamp)
                .map((history, i) => (
                  <NativeItem
                    key={"cardhistory-"+i}
                    leading={
                      <Image
                        source={defaultProfilePicture(card.service as AccountService)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 6,
                          overflow: "hidden",
                          borderWidth: 1,
                          borderColor: theme.colors.border,
                        }}
                      />
                    }
                    trailing={
                      <View
                        style={{
                          paddingRight: 10,
                        }}
                      >
                        {history.amount > 0 ? (
                          <NativeText
                            variant="title"
                            style={{
                              fontFamily: "medium",
                              color: "#00C853",
                            }}
                          >
                            +{history.amount.toFixed(2)} €
                          </NativeText>
                        ) : (
                          <NativeText
                            variant="title"
                            style={{
                              fontFamily: "medium",
                              color: "#FF1744",
                            }}
                          >
                            -{(-history.amount).toFixed(2)} €
                          </NativeText>
                        )}
                      </View>
                    }
                  >
                    <NativeText variant="title">
                      {history.label}
                    </NativeText>

                    {new Date(history.timestamp) && differenceInDays(new Date(), new Date(history.timestamp)) < 30 ? (
                      <NativeText variant="subtitle">
                        il y a {formatDistance(new Date(history.timestamp), new Date(), { locale: fr })} • {new Date(history.timestamp).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          weekday: "short",
                          month: "short",
                        })}
                      </NativeText>
                    ) : (
                      <NativeText variant="subtitle">
                        {new Date(history.timestamp).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          weekday: "long",
                          month: "long",
                          year: new Date(history.timestamp).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                        })}
                      </NativeText>
                    )}
                  </NativeItem>
                ))}
            </NativeList>
          )}

          <InsetsBottomView />
        </ScrollView>

        <LinearGradient
          pointerEvents="none"
          colors={[route.params.card.theme.colors.background + "00", route.params.card.theme.colors.background, route.params.card.theme.colors.background + "00"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 600,
            opacity: 0.1,
          }}
        />
      </>
    );
  }
  catch (e) {
    console.log(e);
    return <View />;
  }
};

export default RestaurantCardDetail;
