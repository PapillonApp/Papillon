import { Image, ScrollView, Text, View } from "react-native";
import MenuCard from "../Cards/Card";
import Reanimated from "react-native-reanimated";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";

import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import { useTheme } from "@react-navigation/native";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import { PressableScale } from "react-native-pressable-scale";
import { useCurrentAccount } from "@/stores/account";
import { AccountService, ExternalAccount } from "@/stores/account/types";
import { QrCode } from "lucide-react-native";
import { balanceFromExternal } from "@/services/balance";
import { reservationHistoryFromExternal } from "@/services/reservation-history";
import { Screen } from "@/router/helpers/types";
import { formatCardIdentifier } from "../Menu";

const RestaurantCardDetail: Screen<"RestaurantCardDetail"> = ({ route, navigation }) => {
  try {
    const { card } = route.params;
    const [cardData, setCardData] = useState(null);

    const theme = useTheme();

    const account = useCurrentAccount((store) => store.account);

    const updateCardData = async () => {
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
        <LinearGradient
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

        <ScrollView
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            padding: 16,
          }}
        >
          <PressableScale
            weight="light"
            activeScale={0.95}
          >
            <Reanimated.View
              style={{
                transform: [
                  { scale: 0.8 },
                ],
                marginVertical: 0,
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
                Carte {AccountService[route.params.card.service as AccountService]} {account?.identity?.firstName ? "de " + account.identity.firstName : ""}
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
              {formatCardIdentifier(card.account?.localID, 12, "")}
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

          {card?.history.length > 0 && (
            <NativeList inline>
              {card.history.sort((a: any, b: any) => b.timestamp - a.timestamp).map((history, i) => (
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
                  <NativeText variant="subtitle">
                    il y a {formatDistance(new Date(history.timestamp), new Date(), { locale: fr })}
                  </NativeText>
                </NativeItem>
              ))}
            </NativeList>
          )}

          <InsetsBottomView />
        </ScrollView>
      </>
    );
  }
  catch (e) {
    console.log(e);
    return <View />;
  }
};

export default RestaurantCardDetail;