import type React from "react";
import { Text, View } from "react-native";
import { NativeText } from "../Global/NativeComponents";
import { useTheme } from "@react-navigation/native";

interface RestaurantCardProps {
  solde: number
  repas: number | null
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ solde, repas }) => {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <View style={{
      height: 80,
      justifyContent: "space-between",
      alignItems: "center",
      overflow: "hidden",
      flexDirection: "row",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    }}>
      <View
        style={{
          flex: 1,
          padding: 15,
        }}
      >
        <NativeText
          style={{
            textAlign: "left",
          }}
        >
          Solde actuel
        </NativeText>
        <Text
          style={{
            textAlign: "left",
            fontFamily: "semibold",
            color: solde < 0 ? "#D10000" : "#5CB21F",
            fontSize: 30,
          }}
        >
          {solde.toFixed(2)} €
        </Text>
      </View>
      {repas !== null && (
        <View
          style={{
            flex: 1,
            padding: 15,
          }}
        >
          <NativeText
            style={{
              textAlign: "right",
              color: colors.text + "50",
            }}
          >
            Repas restants
          </NativeText>
          <Text
            style={{
              textAlign: "right",
              fontFamily: "semibold",
              color: colors.text + "50",
              fontSize: 30,
            }}
          >
            {repas}
          </Text>
        </View>
      )}
    </View>
  );
};

export default RestaurantCard;
