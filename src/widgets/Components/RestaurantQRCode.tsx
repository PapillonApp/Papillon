import { useTheme } from "@react-navigation/native";
import { PieChart, Pizza } from "lucide-react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { Text, View } from "react-native";
import Reanimated, {
  LinearTransition
} from "react-native-reanimated";

import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { WidgetProps } from "@/components/Home/Widget";
import { useCurrentAccount } from "@/stores/account";
import QRCode from "react-native-qrcode-svg";
import { AccountService } from "@/stores/account/types";
import { qrcodeFromExternal } from "@/services/qrcode";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteParameters } from "./../../router/helpers/types";

type NavigationProps = StackNavigationProp<RouteParameters, "RestaurantQrCode">;

const RestaurantQRCodeWidget = forwardRef(({
  setLoading,
  setHidden,
  loading,
}: WidgetProps, ref) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount((store) => store.account);
  const linkedAccounts = useCurrentAccount(store => store.linkedAccounts);
  const [qrcode, setQRCodes] = useState<string[] | null>(null);
  const navigation = useNavigation<NavigationProps>();

  useImperativeHandle(ref, () => ({
    handlePress: () => {
      navigation.navigate("RestaurantQrCode", { QrCodes: qrcode ?? [] });
    }
  }));

  useEffect(() => {
    void async function () {
      setHidden(true);
      setLoading(true);
      const qrcodes: string[] = [];
      const currentHour = new Date().getHours();
      for (const account of linkedAccounts) {
        if (account.service === AccountService.Turboself || account.service === AccountService.ARD) {
          const cardNumber = await qrcodeFromExternal(account);
          if (cardNumber) qrcodes.push(cardNumber);
        }
      }

      setQRCodes(qrcodes);
      setHidden(qrcodes.length === 0 || currentHour < 11 || currentHour > 14);
      setLoading(false);
    }();
  }, [linkedAccounts, setHidden]);

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
          {qrcode && qrcode.length > 1 ? "Toucher pour afficher les QR-Codes" : "Toucher pour afficher le QR-Code"}
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
