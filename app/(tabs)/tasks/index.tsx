import React, { useCallback, useState } from "react";
import TabFlatList from "@/ui/components/TabFlatList";
import { NativeHeaderHighlight, NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Typography from "@/ui/components/Typography";
import { View } from "react-native";
import { CircularProgress } from "@/ui/components/CircularProgress";
import Stack from "@/ui/components/Stack";
import { useTheme } from "@react-navigation/native";
import { AlignCenter, Search } from "lucide-react-native";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import { Dynamic } from "@/ui/components/Dynamic";
import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { Animation } from "@/ui/utils/Animation";
import List from "@/ui/components/List";
import Item from "@/ui/components/Item";

export default function TabOneScreen() {
  const theme = useTheme();
  const colors = theme.colors;

  const [fullyScrolled, setFullyScrolled] = useState(false);

  const handleFullyScrolled = useCallback((isFullyScrolled: boolean) => {
    setFullyScrolled(isFullyScrolled);
  }, []);

  return (
    <>
      <TabFlatList
        backgroundColor={theme.dark ? "#2e0928" : "#F7E8F5"}
        foregroundColor="#9E0086"
        data={Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`)}
        onFullyScrolled={handleFullyScrolled}
        header={(
          <Stack direction={"horizontal"} hAlign={"end"} style={{ padding: 20 }}>
            <Stack direction={"vertical"} gap={2} style={{ flex: 1 }}>
              <Typography inline variant={"h1"} style={{ fontSize: 36, marginBottom: 4 }} color={"#C54CB3"}>
                3
              </Typography>
              <Typography inline variant={"title"} color={"secondary"}>
                tâches restantes
              </Typography>
              <Typography inline variant={"title"} color={"secondary"}>
                cette semaine
              </Typography>
            </Stack>
            <View style={{ width: 80, height: 80, alignItems: "center", justifyContent: "center" }}>
              <CircularProgress backgroundColor={colors.text + "22"} percentageComplete={75} radius={35} strokeWidth={7} fill={"#C54CB3"} />
            </View>
          </Stack>
        )}
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
      />

      <NativeHeaderSide side="Left">
        <NativeHeaderPressable
          onPress={() => {
            console.log("Add new grade pressed");
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
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              width: 200,
              height: 60,
              marginTop: fullyScrolled ? 6 : 0,
            }}
          >
            <Dynamic animated style={{ flexDirection: "row", alignItems: "center", gap: 4, height: 30, marginBottom: -3 }}>
              <Dynamic animated>
                <Typography inline variant="navigation">Semaine</Typography>
              </Dynamic>
              <Dynamic animated style={{ marginTop: -3 }}>
                <NativeHeaderHighlight color="#C54CB3">
                  16
                </NativeHeaderHighlight>
              </Dynamic>
            </Dynamic>
            {fullyScrolled && (
              <Reanimated.View
                style={{
                  width: 200,
                  alignItems: 'center',
                }}
                key="tasks-visible" entering={PapillonAppearIn} exiting={PapillonAppearOut}>
                <Typography inline variant={"body2"} style={{ color: "#C54CB3" }}>
                  Encore 3 tâches restantes
                </Typography>
              </Reanimated.View>
            )}
          </Dynamic>
        </NativeHeaderTopPressable>
      </NativeHeaderTitle>
      <NativeHeaderSide side="Right">
        <NativeHeaderPressable
          onPress={() => {
            console.log("Add new grade pressed");
          }}
        >
          <Search color={colors.text} />
        </NativeHeaderPressable>
      </NativeHeaderSide>
    </>
  );
}