import { useTheme } from "@react-navigation/native";
import { Pizza } from "lucide-react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Text, View } from "react-native";
import Reanimated, {
  LinearTransition
} from "react-native-reanimated";

import { WidgetProps } from "@/components/Home/Widget";
import { useCurrentAccount } from "@/stores/account";
import QRCode from "react-native-qrcode-svg";
import { AccountService } from "@/stores/account/types";
import { qrcodeFromExternal } from "@/services/qrcode";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteParameters } from "./../../router/helpers/types";
import { STORE_THEMES } from "@/views/account/Restaurant/Cards/StoreThemes";
import { formatCardIdentifier, ServiceCard } from "@/utils/external/restaurant";

type NavigationProps = StackNavigationProp<RouteParameters, "RestaurantQrCode">;

const RestaurantQRCodeWidget = forwardRef(({
  setLoading,
  setHidden,
  loading,
}: WidgetProps, ref) => {
  const theme = useTheme();
  const { colors } = theme;

  const linkedAccounts = useCurrentAccount(store => store.linkedAccounts);
  const navigation = useNavigation<NavigationProps>();
  const [allCards, setAllCards] = useState<Array<ServiceCard> | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useImperativeHandle(ref, () => ({
    handlePress: () => {
      if (currentCard) {
        navigation.navigate("RestaurantQrCode", { card: currentCard });
      }
    }
  }));

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  useEffect(() => {
    void async function () {
      setHidden(true);
      setLoading(true);
      const newCards: Array<ServiceCard> = [];
      const currentHour = new Date().getHours();
      const accountPromises = linkedAccounts.map(async (account) => {
        try {
          const [cardnumber] = await Promise.all([
            qrcodeFromExternal(account).catch(err => {
              console.warn(`Error fetching QR code for account ${account}:`, err);
              return "0";
            }),
          ]);

          const newCard: ServiceCard = {
            service: account.service,
            identifier: account.username,
            account: account,
            balance: [],
            history: [],
            cardnumber: cardnumber,
            // @ts-ignore
            theme: STORE_THEMES.find((theme) => theme.id === AccountService[account.service]) ?? STORE_THEMES[0],
          };

          newCards.push(newCard);
        } catch (error) {
          console.warn(`An error occurred with account ${account}:`, error);
        }
      });

      await Promise.all(accountPromises);
      setAllCards(newCards);
      setHidden(!(allCards?.some(card => card.cardnumber) && currentHour >= 11 && currentHour <= 14));
      setLoading(false);
    }();
  }, [linkedAccounts, setHidden]);

  useEffect(() => {
    if (allCards && allCards.length > 1) {
      const interval = setInterval(() => {
        setCurrentCardIndex((prevIndex) => (prevIndex + 1) % allCards.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [allCards]);

  const currentCard = allCards?.[currentCardIndex];

  return (
    <>
      <View
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "row",
          width: "100%",
          gap: 7,
          opacity: 0.5,
        }}
      >
        <Pizza size={20} color={colors.text} />
        <Text
          style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
          }}
        >
          Cantine scolaire
        </Text>
      </View>

      <Reanimated.View
        style={{
          alignItems: "flex-start",
          justifyContent: "center",
          flexDirection: "column",
          width: "100%",
          height: "90%",
          gap: 4,
        }}
        layout={LinearTransition}
      >
        <Reanimated.Text
          style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
            maxWidth: "90%",
          }}
          layout={LinearTransition}
        >
          Toucher pour afficher le QR-Code
        </Reanimated.Text>
        <Reanimated.Text
          style={{
            fontSize: 15,
            letterSpacing: 1.5,
            fontFamily: "medium",
            opacity: 0.5,
          }}
          layout={LinearTransition}
        >
          {formatCardIdentifier(currentCard?.account?.localID as string)}
        </Reanimated.Text>
        <View style={{
          position: "absolute",
          right: 0,
        }}>
          <QRCode
            value="0"
            size={70}
            color = {colors.text + "10"}
            backgroundColor="#FFFFFF00"
          />
        </View>
      </Reanimated.View>
    </>
  );
});

export default RestaurantQRCodeWidget;
