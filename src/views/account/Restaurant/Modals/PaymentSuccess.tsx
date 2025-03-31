import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { Screen } from "@/router/helpers/types";
import { reservationHistoryFromExternal } from "@/services/reservation-history";
import { ExternalAccount } from "@/stores/account/types";
import { anim2Papillon } from "@/utils/ui/animations";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { AlertCircle, Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { FadeInDown, FadeOutUp } from "react-native-reanimated";

const RestaurantPaymentSuccess: Screen<"RestaurantPaymentSuccess"> = ({ route, navigation }) => {
  const { card, diff } = route.params;
  const theme = useTheme();

  const [lastPayment, setLastPayment] = useState<PaymentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reservationHistoryFromExternal(card.account as ExternalAccount).then((history) => {
      // @ts-expect-error
      setLastPayment(history[0]);
      setLoading(false);
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        backgroundColor: theme.colors.background,
        paddingHorizontal: 16,
      }}
    >
      {loading && (
        <NativeList
          animated
          entering={anim2Papillon(FadeInDown)}
          exiting={anim2Papillon(FadeOutUp)}
        >
          <NativeItem
            leading={
              <PapillonSpinner
                size={24}
                strokeWidth={3}
                color={theme.colors.text + "80"}
              />
            }
          >
            <NativeText variant="subtitle">
              Vérification de la transaction de {(-diff).toFixed(2)} € avec votre historique de paiements
            </NativeText>
          </NativeItem>
        </NativeList>
      )}

      {lastPayment && (
        <>
          <NativeList
            inline
            animated
            entering={anim2Papillon(FadeInDown)}
            exiting={anim2Papillon(FadeOutUp)}
          >
            <View
              style={{
                gap: 6,
                paddingVertical: 16,
                paddingBottom: 20,
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 48,
                  fontFamily: "semibold",
                  textAlign: "center",
                }}
              >
                -{(-lastPayment.amount).toFixed(2)} €
              </Text>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 15,
                  opacity: 0.5,
                  fontFamily: "medium",
                  textAlign: "center",
                }}
              >
                {// @ts-expect-error
                  new Date(lastPayment.timestamp).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric" })}
              </Text>
            </View>
          </NativeList>

          { // @ts-expect-error
            diff == lastPayment.amount ? (
              <NativeList
                inline
                animated
                entering={anim2Papillon(FadeInDown).delay(50)}
                exiting={anim2Papillon(FadeOutUp)}
              >
                <NativeItem
                  style={{
                    backgroundColor: "#00943620",
                  }}
                  androidStyle={{
                    backgroundColor: "#00943620",
                  }}
                  leading={
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 20,
                        backgroundColor: "#009436",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Check size={18} strokeWidth={3} color={"#fff"} />
                    </View>
                  }
                >
                  <NativeText variant="title">
                    Transaction valide
                  </NativeText>
                  <NativeText variant="subtitle">
                    Comparaison de solde effectuée et validée par Papillon
                  </NativeText>
                </NativeItem>
              </NativeList>
            ) : (
              <NativeList inline
                animated
                entering={anim2Papillon(FadeInDown).delay(50)}
                exiting={anim2Papillon(FadeOutUp)}
              >
                <NativeItem
                  style={{
                    backgroundColor: "#9e570020",
                  }}
                  androidStyle={{
                    backgroundColor: "#9e570020",
                  }}
                  leading={
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 20,
                        backgroundColor: "#9e5700",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <AlertCircle size={20} strokeWidth={2.5} color={"#fff"} />
                    </View>
                  }
                >
                  <NativeText variant="title">
                    Impossible de vérifier la transaction
                  </NativeText>
                  <NativeText variant="subtitle">
                    Le paiement et le solde de votre compte ne correspondent pas
                  </NativeText>
                </NativeItem>
              </NativeList>
            )}
        </>
      )}
    </View>
  );
};

export default RestaurantPaymentSuccess;