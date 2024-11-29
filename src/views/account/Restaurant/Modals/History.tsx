import MissingItem from "@/components/Global/MissingItem";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { ReservationHistory } from "@/services/shared/ReservationHistory";
import { animPapillon } from "@/utils/ui/animations";
import { Fragment, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { FadeInDown, FadeOut } from "react-native-reanimated";
import { RouteParameters } from "../../../../router/helpers/types";
import { RouteProp } from "@react-navigation/native";

type NavigationProps = RouteProp<RouteParameters, "RestaurantHistory">;

const RestaurantHistory = ({ route }: { route: NavigationProps }) => {
  const histories = route.params?.histories ?? [];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      month: "long",
      day: "numeric"
    }).toUpperCase();
  };

  const groupedHistories = useMemo(() => {
    const historyMap = new Map<string, ReservationHistory[]>();

    histories.sort((a, b) => b.timestamp - a.timestamp);

    histories.forEach((history: ReservationHistory) => {
      const formattedDate = formatDate(history.timestamp);
      if (!historyMap.has(formattedDate)) {
        historyMap.set(formattedDate, []);
      }
      historyMap.get(formattedDate)?.push(history);
    });

    historyMap.forEach((value) => {
      value.sort((a, b) => b.timestamp - a.timestamp);
    });

    return Array.from(historyMap);
  }, [histories]);


  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {histories === null ? (
        <NativeText>Chargement...</NativeText>
      ) : histories.length === 0 ? (
        <MissingItem
          emoji="🧾"
          title="Aucune réservation"
          description="Effectuez une réservation pour la voir apparaître ici."
          entering={animPapillon(FadeInDown)}
          exiting={animPapillon(FadeOut)}
        />
      ) : (
        groupedHistories.map(([date, reservations], i) => (
          <Fragment key={i}>
            <NativeListHeader label={date} />
            <NativeList>
              {reservations.map((history: ReservationHistory, j: number) => {
                const time = new Date(history.timestamp).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <NativeItem key={j}>
                    <View style={styles.row}>
                      <View>
                        <NativeText variant="title">{history.label}</NativeText>
                        <NativeText variant="subtitle">{time}</NativeText>
                      </View>
                      <NativeText variant="titleLarge" style={{
                        color: history.amount < 0 ? "#D10000" : "#5CB21F",
                      }}>
                        {history.amount > 0 ? "+" : "" }{history.amount.toFixed(2)}€
                      </NativeText>
                    </View>
                  </NativeItem>
                );
              })}
            </NativeList>
          </Fragment>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default RestaurantHistory;
