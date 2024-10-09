import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import {
  X,
  Clock2,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Wallet,
} from "lucide-react-native";

import type { Screen } from "@/router/helpers/types";
import RestaurantCard from "@/components/Restaurant/RestaurantCard";
import { HorizontalList, Item } from "@/components/Restaurant/ButtonList";
import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import TabAnimatedTitle from "@/components/Global/TabAnimatedTitle";
import { Balance } from "@/services/shared/Balance";
import { balanceFromExternal } from "@/services/balance";

const Menu: Screen<"Menu"> = ({
  route,
  navigation,
}) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount(store => store.account);
  const linkedAccounts = useCurrentAccount(store => store.linkedAccounts);

  useLayoutEffect(() => {
    navigation.setOptions({
      ...TabAnimatedTitle({ route, navigation }),
    });
  }, [navigation, route.params, theme.colors.text]);

  const [balances, setBalances] = useState<Balance[] | null>(null);

  useEffect(() => {
    void async function () {
      const balances: Balance[] = [];
      for (const account of linkedAccounts) {
        const balance = await balanceFromExternal(account);
        balances.push(...balance);
      }

      setBalances(balances);
    }();
  }, [linkedAccounts]);

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {balances ? balances.map((balance, index) => (
        <RestaurantCard
          key={index}
          solde={balance.amount}
          repas={balance.remaining}
        />
      )) : <View />}

      <HorizontalList style={styles.horizontalList}>
        <Item
          title="Historique"
          icon={<Clock2 color={colors.text} />}
          onPress={() => navigation.navigate("RestaurantHistory")}
        />
        <Item
          title="QR-Code"
          icon={<QrCode color={colors.text} />}
          onPress={() => navigation.navigate("RestaurantQrCode")}
        />
      </HorizontalList>

      <View style={styles.calendarContainer}>
        <TouchableOpacity style={styles.calendarButton}>
          <ChevronLeft color={colors.text + "70"} />
        </TouchableOpacity>
        <View
          style={[
            styles.calendarTextContainer,
            { backgroundColor: colors.primary + "22" },
          ]}
        >
          <Calendar size={20} color={colors.primary} />
          <Text
            style={[styles.calendarText, { color: colors.primary }]}
          >
            vendredi 03 avril
          </Text>
        </View>
        <TouchableOpacity style={styles.calendarButton}>
          <ChevronRight color={colors.text + "70"} />
        </TouchableOpacity>
      </View>

      <NativeListHeader label="Menus du jour" />
      <NativeList>
        <NativeItem>
          <NativeText variant="subtitle">Entrée</NativeText>
          <NativeText variant="title">Salade de tomates</NativeText>
          <NativeText variant="title">Kebab maison</NativeText>
        </NativeItem>
        <NativeItem>
          <NativeText variant="subtitle">Plat</NativeText>
          <NativeText variant="title">Poulet rôti</NativeText>
          <NativeText variant="title">Pâtes</NativeText>
        </NativeItem>
        <NativeItem>
          <NativeText variant="subtitle">Dessert</NativeText>
          <NativeText variant="title">Yaourt</NativeText>
          <NativeText variant="title">Fruit</NativeText>
        </NativeItem>
        <NativeItem>
          <NativeText variant="subtitle">Boisson</NativeText>
          <NativeText variant="title">Eau</NativeText>
          <NativeText variant="title">Coca-Cola</NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  lottieIcon: {
    width: 26,
    height: 26,
  },
  headerTitleText: {
    fontFamily: "semibold",
    fontSize: 17.5,
  },
  headerRightButton: {
    padding: 6,
    borderRadius: 18,
    opacity: 0.6,
  },
  scrollViewContent: {
    padding: 16,
  },
  horizontalList: {
    marginTop: 10,
  },
  calendarContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: -10,
    gap: 10,
  },
  calendarButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  calendarTextContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: "row",
    gap: 6,
  },
  calendarText: {
    fontFamily: "semibold",
    fontSize: 17,
  },
});

export default Menu;
