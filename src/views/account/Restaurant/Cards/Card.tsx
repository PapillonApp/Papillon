import { View, Text, StyleSheet, Image } from "react-native";
import { formatCardIdentifier, ServiceCard } from "@/utils/external/restaurant";
import { useTheme } from "@react-navigation/native";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import { PressableScale } from "react-native-pressable-scale";
import { AccountService } from "@/stores/account/types";

const MenuCard = ({ card, onPress }: { card: ServiceCard, onPress?: () => void }) => {
  const theme = useTheme();

  return (
    <PressableScale
      weight="light"
      activeScale={0.95}
      onPress={onPress}
    >
      <View
        style={[
          styles.card,
          {
            borderColor: theme.colors.text + "33",
            borderWidth: 1,
            backgroundColor: card?.theme?.colors?.background,
            shadowColor: card?.theme?.colors?.background
          }
        ]}
      >
        <View
          style={[
            styles.cardHeader,
          ]}
        >
          <Image
            source={defaultProfilePicture(card.service as AccountService)}
            style={[styles.cardHeaderIcon]}
          />
          <Text
            style={[styles.cardHeaderName, { color: card?.theme?.colors?.text }]}
          >
            {card?.theme?.name}
          </Text>
          <View style={[styles.cardBalances]}>
            {card.balance?.map((balance, index) =>
              balance.amount && (
                <View key={index} style={[styles.cardBalance]}>
                  <Text style={[styles.cardBalanceTitle, { color: card?.theme?.colors?.accent }]}>
                    {balance.label}
                  </Text>
                  <Text style={[styles.cardBalanceValue, { color: card?.theme?.colors?.text }]}>
                    {balance.amount.toFixed(2) + " €"}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>

        {card.identifier && (
          <Text
            style={[
              styles.cardFloatingIdentifier,
              { color: card?.theme?.colors?.text }
            ]}
          >
            {formatCardIdentifier(card.account?.localID as string)}
          </Text>
        )}

        {card?.theme?.background && (
          <Image
            source={card?.theme?.background}
            style={styles.image}
          />
        )}
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    aspectRatio: 36 / 21,

    borderRadius: 12,
    borderCurve: "continuous",

    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  image: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,

    borderRadius: 12,
    borderCurve: "continuous",
  },

  cardHeader: {
    width: "100%",
    padding: 10,
    flexDirection: "row",
    gap: 10,
  },

  cardBalances: {
    gap: 5
  },

  cardHeaderName: {
    fontSize: 16,
    fontFamily: "semibold",
    flex: 1,
    marginTop: 9,
  },

  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderCurve: "continuous",
    overflow: "hidden",
  },

  cardBalance: {
    alignItems: "flex-end",
    gap: 2,
  },

  cardBalanceTitle: {
    fontSize: 12,
    fontFamily: "semibold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  cardBalanceValue: {
    fontSize: 18,
    fontFamily: "semibold",
    letterSpacing: 0.5,
  },

  cardFloatingIdentifier: {
    position: "absolute",
    bottom: 16,
    left: 16,
    fontSize: 15,
    letterSpacing: 1.5,
    fontFamily: "medium",
    opacity: 0.5,
  },
});

export default MenuCard;