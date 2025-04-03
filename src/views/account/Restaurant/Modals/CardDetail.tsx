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
import { error, warn } from "@/utils/logger/logger";

const RestaurantCardDetail: Screen<"RestaurantCardDetail"> = ({ route, navigation }) => {
  try {
    const { card } = route.params;
    const [cardData, setCardData] = useState(card);

    const theme = useTheme();

    const account = useCurrentAccount((store) => store.account);
    const removeAccount = useAccounts((state) => state.remove);

    const cardName = `Carte ${AccountService[cardData.service as AccountService]} ${account?.identity?.firstName ? "de " + account.identity.firstName : ""}`;

    React.useLayoutEffect(() => {
      if (Platform.OS === "ios") {
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
          balanceFromExternal(cardData.account as ExternalAccount).catch((err) => {
            warn(`Error fetching balance for account ${account?.name}:` + err, "CardDetail/balanceFromExternal");
            return [];
          }),
          reservationHistoryFromExternal(cardData.account as ExternalAccount).catch((err) => {
            warn(`Error fetching history for account ${account?.name}:` + err, "CardDetail/reservationHistoryFromExternal");
            return [];
          })
        ]);

        setCardData({
          ...card,
          balance,
          history,
        });
      }
      catch (e) {
        error("" + (e as Error)?.stack, "CardDetail/updateCardData");
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
              <MenuCard card={cardData} />
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
              {formatCardIdentifier(cardData.account?.localID as string, 12, "")}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
            }}
          >
            {cardData?.balance[0] && (
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
                      color: cardData.balance[0].amount > 0 ? "#00C853" : "#FF1744",
                    }}
                  >
                    {cardData.balance[0].amount > 0 && "+"}{cardData.balance[0].amount.toFixed(2)} €
                  </Text>
                </View>
              </NativeList>
            )}

            {cardData?.cardnumber && (
              <PressableScale
                onPress={() => navigation.navigate("RestaurantQrCode", { card: cardData })}
                weight="light"
                activeScale={0.95}
              >
                <NativeList inline style={{ width: 100, height: 76 }}>
                  <View
                    style={{
                      height: 76,
                      gap: 6,
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <QrCode
                      size={24}
                      strokeWidth={2.2}
                      color={theme.colors.text}
                    />
                    <Text
                      style={{
                        fontFamily: "semibold",
                        fontSize: 13,
                        color: theme.colors.text,
                        textAlign: "center",
                      }}
                    >
                      QR-code
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

          {cardData?.history.length > 0 && (
            <NativeList inline>
              {cardData.history
                .filter((event) => !isNaN(new Date(event.timestamp).getTime()))
                .sort((a: any, b: any) => b.timestamp - a.timestamp)
                .map((history, i) => (
                  <NativeItem
                    key={"cardhistory-"+i}
                    leading={
                      <Image
                        source={defaultProfilePicture(cardData.service as AccountService)}
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
          colors={[cardData.theme.colors.background + "00", cardData.theme.colors.background, cardData.theme.colors.background + "00"]}
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
    error("" + (e as Error)?.stack, "CardDetail");
    return <View />;
  }
};

export default RestaurantCardDetail;
