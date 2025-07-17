import React, { useCallback, useState } from "react";
import { View, Dimensions, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate, useScrollViewOffset, useAnimatedRef, AnimatedRef, LinearTransition,
} from "react-native-reanimated";

import { Animation } from "@/ui/utils/Animation";
import Typography from "@/ui/components/Typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Stack from "@/ui/components/Stack";
import { Dynamic } from "@/ui/components/Dynamic";
import { NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import { AlignCenter, ChevronDown, Ellipsis, Search } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import AnimatedModalLayout from "@/ui/components/AnimatedModalLayout";
import { CircularProgress } from "@/ui/components/CircularProgress";

export default function TabOneScreen() {
  const insets = useSafeAreaInsets();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const windowHeight = Dimensions.get('window').height;
  const toggleDatePicker = useCallback(() => {
    setShowDatePicker((prev) => !prev);
  }, []);

  const theme = useTheme();
  const { colors } = useTheme();


  return (
    <AnimatedModalLayout
      backgroundColor={theme.dark ? "#000000" : "#F0F0F0"}
      headerHeight={200}
      background={
        <Image
          source={require('@/assets/images/background/profil.png')}
          resizeMode="cover"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 350
          }}
        />
      }
      headerContent={
        <>
          <NativeHeaderSide side="Left">
            <NativeHeaderPressable
              onPress={() => {
                console.log("Pressed");
              }}
            >
              <AlignCenter color={colors.text} />
            </NativeHeaderPressable>
          </NativeHeaderSide>
          <NativeHeaderTitle key={`header-title`}>
            <NativeHeaderTopPressable onPress={toggleDatePicker} layout={Animation(LinearTransition)}>
              <Dynamic
                animated={false}
                style={{ flexDirection: "column", alignItems: "center", gap: 4 }}
              >
                <Dynamic style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Dynamic animated>
                    <Typography variant="navigation">Mon profil</Typography>
                  </Dynamic>
                  <Dynamic animated>
                    <ChevronDown color={colors.text} opacity={0.7} />
                  </Dynamic>
                </Dynamic>
              </Dynamic>
            </NativeHeaderTopPressable>
          </NativeHeaderTitle>
          <NativeHeaderSide side="Right">
            <NativeHeaderPressable
              onPress={() => {
                console.log("Pressed");
              }}
            >
              <Ellipsis color={colors.text} />
            </NativeHeaderPressable>
          </NativeHeaderSide>
          <Stack direction={"horizontal"} hAlign={"center"} style={{ padding: 20 }}>
            <Stack direction={"vertical"} hAlign={"center"} gap={10} style={{ flex: 1 }}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={{ width: 75, height: 75, borderRadius: 500 }}
              />
              <Typography variant={"h2"} color="#545454">
                Lucas Lavajo
              </Typography>
              <Stack direction={"horizontal"} hAlign={"center"} vAlign={"center"} gap={10}>
                <Stack direction={"vertical"} hAlign={"center"} radius={100} backgroundColor={colors.background} inline style={{ borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Typography variant={"body2"} color="#606060">
                    T6
                  </Typography>
                </Stack>
                <Stack direction={"vertical"} hAlign={"center"} radius={100} backgroundColor={colors.background} inline style={{ borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Typography variant={"body2"} color="#606060">
                    Lycée Frédéric Bazille
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </>
      }
      modalContent={<View style={{ height: windowHeight }} />}
    />
  );
}