import React, { useEffect } from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import Svg, { G, Rect, Polygon } from "react-native-svg";
import { StyleSheet, Dimensions, View, Text, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import Reanimated, { useSharedValue, withRepeat, withSpring, withSequence, withTiming, Easing } from "react-native-reanimated";

const generatePoints = (width: number, numberOfLines: number, heightDec: number) => {
  const point1 = `${(width / 2) - 10},${24 + numberOfLines * 20 + heightDec}`;
  const point2 = `${(width / 2) + 10},${24 + numberOfLines * 20 + heightDec}`;
  const point3 = `${(width / 2)},${24 + numberOfLines * 20 + 8 + heightDec}`;
  return `${point1} ${point2} ${point3}`;
};

const PapillonShineBubble: React.FC<{
  message: string,
  width: number,
  numberOfLines: number,
  offsetTop?: DimensionValue,
  noFlex?: boolean,
  style?: StyleProp<ViewStyle>
}> = ({
  message,
  width = 230,
  numberOfLines = 1,
  offsetTop = 0,
  noFlex = false,
  style,
}) => {
  const { colors } = useTheme();
  let height = 24 + numberOfLines * 20;

  const translateY = useSharedValue(0);
  const rotate = useSharedValue("0deg"); // '0deg' or '180deg

  const shadowScale = useSharedValue(1);

  // make the logo bounce on each side infinitely
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    rotate.value = withRepeat(
      withSequence(
        withTiming("5deg", { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming("-5deg", { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    shadowScale.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const bubbleScale = useSharedValue(0);
  const bubbleOpacity = useSharedValue(0);
  const bubbleTranslateY = useSharedValue(20);

  useEffect(() => {
    bubbleOpacity.value = withTiming(1, { duration: 300 });
    bubbleTranslateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    bubbleScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, []);

  const [sHeight, setSHeight] = React.useState(Dimensions.get("window").height / Dimensions.get("window").scale);
  const [sWidth, setSWidth] = React.useState(Dimensions.get("window").width / Dimensions.get("window").scale);

  useEffect(() => {
    Dimensions.addEventListener("change", ({ window }) => {
      setSHeight(window.height / window.scale);
      setSWidth(window.width / window.scale);
    });
  }, []);

  return (
    <View
      style={[
        papillon_ls_styles.container,
        {
          flex: noFlex ? 0 : 1,
        },
        style,
        sWidth > 450 && {
          marginTop: -100,
          marginBottom: 50,
        }
      ]}
    >
      <Reanimated.View
        style={[
          papillon_ls_styles.bubble,
          {
            opacity: bubbleOpacity,
            transform: [
              {
                scale: bubbleScale
              },
              {
                translateY: bubbleTranslateY
              }
            ],
          },
          {
            marginTop: offsetTop,
          }
        ]}
      >
        <Text
          style={{
            color: colors.text + "e5",
            fontSize: 16,
            fontFamily: "medium",
            position: "absolute",

            top: (24 + numberOfLines * 20 - 19.5 * numberOfLines) / 2,
            width: width,
            textAlign: "center",
            paddingHorizontal: 10,

            lineHeight: 20,

            zIndex: 1,
          }}
          numberOfLines={numberOfLines}
          ellipsizeMode="tail"
        >
          {message}
        </Text>

        <Svg width={width + 2} height={height + 10 + 2} fill={colors.card}>
          <G stroke={colors.border} x={1} y={1} strokeWidth={1.5} fill={colors.card}>
            <Rect width={width} height={height} rx={9} />
            <Polygon points={generatePoints(width, numberOfLines, 0)} />
          </G>
          <G fill={colors.card} x={2} y={2}>
            <Polygon points={generatePoints(width - 2, numberOfLines, -2)} />
          </G>
        </Svg>
      </Reanimated.View>

      <View
        style={papillon_ls_styles.full_logo}
      >

        <Reanimated.Image
          source={require("../../../assets/images/shaded_papillon_setup.png")}
          style={[
            papillon_ls_styles.logo,
            {
              transform: [
                {
                  translateY: translateY
                },
                {
                  rotate: rotate
                },
              ],
            }
          ]}
          resizeMode="contain"
        />

        <Reanimated.Image
          source={require("../../../assets/images/shaded_papillon_setup_shadow.png")}
          style={{
            transform: [
              {
                scale: shadowScale
              },
            ],
          }}
          resizeMode="contain"
          tintColor={"#000000"}
        />
      </View>
    </View>
  );
};

const papillon_ls_styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  bubble: {
    position: "relative",
    marginBottom: 20,
  },

  full_logo: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },

  logo: {
    width: 82,
    height: 82,
  }
});

export default PapillonShineBubble;