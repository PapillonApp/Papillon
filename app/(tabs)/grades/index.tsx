import React, { useCallback, useState } from "react";
import { View, Dimensions } from "react-native";
import { LinearTransition } from "react-native-reanimated";

import { Animation } from "@/ui/utils/Animation";
import Typography from "@/ui/components/Typography";
import Stack from "@/ui/components/Stack";
import { Dynamic } from "@/ui/components/Dynamic";
import { NativeHeaderTitle } from "@/ui/components/NativeHeader";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import { ChevronDown } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import AnimatedModalLayout from "@/ui/components/AnimatedModalLayout";

export default function TabOneScreen() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const windowHeight = Dimensions.get('window').height;
  const toggleDatePicker = useCallback(() => {
    setShowDatePicker((prev) => !prev);
  }, []);

  const { colors } = useTheme();

  return (
    <AnimatedModalLayout
      backgroundColor={"#E5F5F6"}
      headerContent={
        <>
          <NativeHeaderTitle>
            <NativeHeaderTopPressable
              onPress={toggleDatePicker}
              layout={Animation(LinearTransition)}
            >
              <Dynamic style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Dynamic animated>
                  <View style={{ paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8, backgroundColor: "#FFFFFF"}}>
                    <Typography variant="navigation" style={{ color: "#009EA7" }}>2025</Typography>
                  </View>
                </Dynamic>
                <Dynamic animated>
                  <Typography variant="navigation">Semestre 2</Typography>
                </Dynamic>
                <Dynamic animated>
                  <ChevronDown color={colors.text} opacity={0.7} />
                </Dynamic>
              </Dynamic>
            </NativeHeaderTopPressable>
          </NativeHeaderTitle>
          <Stack direction={"horizontal"} hAlign={"center"} style={{ padding: 16 }}>
            <Stack direction={"vertical"} gap={0} style={{ flex: 1 }}>
              <Stack direction={"horizontal"} gap={3} hAlign={"end"}>
                <Typography variant={"h1"} style={{ fontSize: 32 }} color={"#009EA7"}>15</Typography>
                <Typography variant={"h2"} style={{ paddingBottom: 2}} color={"#009EA7"}>.72</Typography>
                <Typography variant={"h5"} color={"#009EA7"}>/20</Typography>
              </Stack>
              <Stack direction={"horizontal"} hAlign={"center"} gap={3}>
                <Typography variant={"h4"} color={"#009EA7"}>Moyenne des matières</Typography>
                <ChevronDown color={"#009EA7"} />
              </Stack>
              <Typography variant={"body1"} color={"#009EA7"}>Pondération</Typography>
            </Stack>
          </Stack>
        </>
      }
      modalContent={<View style={{ height: windowHeight }}/>}
    />
  );
}