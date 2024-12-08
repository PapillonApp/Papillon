import { useTheme } from "@react-navigation/native";
import { Pizza } from "lucide-react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { Text, View } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { WidgetProps } from "@/components/Home/Widget";
import { useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import { Balance } from "@/services/shared/Balance";
import { balanceFromExternal } from "@/services/balance";

const RestaurantBalanceWidget = forwardRef(({
  setLoading,
  setHidden,
  loading,
}: WidgetProps, ref) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount((store) => store.account);
  const linkedAccounts = useCurrentAccount(store => store.linkedAccounts);
  const [balances, setBalances] = useState<Balance[] | null>(null);
  const [currentBalanceIndex, setCurrentBalanceIndex] = useState(0);

  useImperativeHandle(ref, () => ({
    handlePress: () => "Menu"
  }));

  useEffect(() => {
    void async function () {
      setHidden(true);
      setLoading(true);
      const balances: Balance[] = [];
      for (const account of linkedAccounts) {
        if (account.service === AccountService.Turboself || account.service === AccountService.ARD) {
          const balance = await balanceFromExternal(account);
          balances.push(...balance);
        }
      }
      setBalances(balances);
      setHidden(balances.length === 0 || balances.every(balance => balance.remaining === 0));
      setLoading(false);
    }();
  }, [linkedAccounts, setHidden]);

  useEffect(() => {
    if (balances && balances.length > 1) {
      const interval = setInterval(() => {
        setCurrentBalanceIndex((prevIndex) => (prevIndex + 1) % balances.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [balances]);

  const currentBalance = balances?.[currentBalanceIndex];

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
          Solde du Self
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
        <AnimatedNumber
          value={currentBalance ? `${currentBalance.amount.toFixed(2).toString()}${currentBalance.currency}` : "0.00€"}
          style={{
            fontSize: 37,
            lineHeight: 37,
            fontFamily: "semibold",
            color: (currentBalance?.remaining ?? 0) <= 0
              ? "#D10000"
              : "#5CB21F",
          }}
          contentContainerStyle={{
            paddingLeft: 6,
          }}
        />
        {currentBalance?.remaining !== undefined && currentBalance?.remaining !== null && (
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: (currentBalance?.remaining ?? 0) <= 0
              ? "#D1000035"
              : "#5CB21F35",
            borderRadius: 6,
          }}>
            <Text
              style={{
                color: (currentBalance?.remaining ?? 0) <= 0
                  ? "#D10000"
                  : "#5CB21F",
                fontFamily: "medium",
                fontSize: 16,
                paddingHorizontal: 7,
                paddingVertical: 3,
              }}
            >
              {Math.max(0, currentBalance?.remaining ?? 0)} {currentBalance?.remaining === 1 ? "repas restant" : "repas restants"}
            </Text>
          </View>
        )}
      </Reanimated.View>
    </>
  );
});

export default RestaurantBalanceWidget;
