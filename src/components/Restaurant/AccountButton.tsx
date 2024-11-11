import { Coffee, Utensils } from "lucide-react-native";
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Reanimated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import {Balance} from "@/services/shared/Balance";
import {Theme} from "@react-navigation/native";

const AnimatedTouchableOpacity = Reanimated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Reanimated.createAnimatedComponent(View);

interface AccountButtonProps {
  account: Balance
  isSelected: boolean
  onPress: () => any
  colors: Theme["colors"]
}

const AccountButton: React.FC<AccountButtonProps> = ({ account, isSelected, onPress, colors }) => {
  const COLLAPSED_WIDTH = 47;
  const [textMeasurement, setTextMeasurement] = React.useState(0);
  const EXPANDED_WIDTH = React.useMemo(() => COLLAPSED_WIDTH + textMeasurement + 16, [textMeasurement]); // 16 pour le gap

  const width = useSharedValue(isSelected ? EXPANDED_WIDTH : COLLAPSED_WIDTH);
  const textOpacity = useSharedValue(isSelected ? 1 : 0);
  const textScale = useSharedValue(isSelected ? 1 : 0.7);
  const textWidth = useSharedValue(isSelected ? textMeasurement : 0);

  const springConfig = {
    damping: 15,
    mass: 0.5,
    stiffness: 120,
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    width: withSpring(width.value, springConfig),
  }));

  const animatedTextContainerStyle = useAnimatedStyle(() => ({
    width: withTiming(textWidth.value, {
      duration: 150,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    }),
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: withTiming(textOpacity.value, {
      duration: 150,
      easing: Easing.ease,
    }),
    transform: [{ scale: withTiming(textScale.value, { duration: 150 }) }],
  }));

  React.useEffect(() => {
    if (textMeasurement > 0) {
      width.value = isSelected ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
      textOpacity.value = isSelected ? 1 : 0;
      textScale.value = isSelected ? 1 : 0.7;
      textWidth.value = isSelected ? textMeasurement : 0;
    }
  }, [isSelected, textMeasurement]);

  return (
    <>
      {/* Composant de mesure invisible */}
      <Text
        style={{
          position: "absolute",
          opacity: 0,
          fontSize: 13,
          fontFamily: "semibold",
        }}
        onLayout={({ nativeEvent: { layout: { width } } }) => {
          setTextMeasurement(width);
        }}
      >
        {account.label}
      </Text>

      <AnimatedTouchableOpacity
        onPress={onPress}
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isSelected ? colors.primary + "20" : colors.card,
            borderColor: colors.border,
            borderWidth: isSelected ? 0 : 1,
            paddingVertical: 12,
            borderRadius: 15,
            paddingHorizontal: 12,
            gap: 8,
            overflow: "hidden",
          },
          animatedContainerStyle,
        ]}
      >
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}>
          <Reanimated.View>
            {(account.label).match(/\b(CAFETARIA|SNACK)\b/i) ? (
              <Coffee color={isSelected ? colors.primary : colors.text} size={20} />
            ) : (
              <Utensils color={isSelected ? colors.primary : colors.text} size={20} />
            )}
          </Reanimated.View>
          {isSelected && (
            <AnimatedView
              style={[
                {
                  overflow: "hidden",
                },
                animatedTextContainerStyle
              ]}
            >
              <Reanimated.Text
                numberOfLines={1}
                style={[
                  {
                    fontFamily: "semibold",
                    fontSize: 13,
                    color: colors.primary,
                  },
                  animatedTextStyle,
                ]}
              >
                {account.label}
              </Reanimated.Text>
            </AnimatedView>
          )}
        </View>
      </AnimatedTouchableOpacity>
    </>
  );
};

export default AccountButton;
