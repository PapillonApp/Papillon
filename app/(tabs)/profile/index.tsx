import React, { useCallback, useState } from "react";
import { View, Dimensions, Image } from "react-native";
import {
  LinearTransition,
} from "react-native-reanimated";

import { Animation } from "@/ui/utils/Animation";
import Typography from "@/ui/components/Typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Stack from "@/ui/components/Stack";
import { Dynamic } from "@/ui/components/Dynamic";
import { NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import { AlignCenter, ChevronDown, Ellipsis } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import TabFlatList from "@/ui/components/TabFlatList";
import List from "@/ui/components/List";
import Item from "@/ui/components/Item";

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

  const [fullyScrolled, setFullyScrolled] = useState(false);

  const handleFullyScrolled = useCallback((isFullyScrolled: boolean) => {
    setFullyScrolled(isFullyScrolled);
  }, []);


  return (
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
      <NativeHeaderTitle ignoreTouch key={`header-title:` + fullyScrolled}>
        <NativeHeaderTopPressable layout={Animation(LinearTransition)}>
          <Dynamic
            animated={true}
            style={{
              flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
              marginTop: fullyScrolled ? 6 : 0
            }}
          >
            <Dynamic style={{ flexDirection: "row", alignItems: "center", gap: 4, width: 200, justifyContent: "center" }}>
              <Dynamic animated>
                <Typography inline variant="navigation">Mon profil</Typography>
              </Dynamic>
            </Dynamic>
            {fullyScrolled && (
              <Dynamic animated>
                <Typography inline variant="body2" color="secondary">
                  Lucas Lavajo
                </Typography>
              </Dynamic>
            )}
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

      <TabFlatList
        backgroundColor={theme.dark ? "#000000" : "#F0F0F0"}
        height={200}
        onFullyScrolled={handleFullyScrolled}
        data={Array.from({ length: 100 }, (_, i) => `Tâche ${i + 1}`)}
        renderItem={({ item, index }) => (
          <List>
            <Item>
              <Typography variant="title">
                {item}
              </Typography>
              <Typography variant="caption" color="secondary">
                {`Détails de la tâche ${index + 1}`}
              </Typography>
            </Item>
          </List>
        )}
        keyExtractor={(item) => item}
        header={
          <>
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
    </>
  );
}