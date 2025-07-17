import React, { useCallback, useState, useMemo } from "react";
import { View, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useScrollViewOffset,
  useAnimatedRef,
  AnimatedRef,
  LinearTransition,
} from "react-native-reanimated";

import { Animation, PapillonFadeIn, PapillonFadeOut } from "@/ui/utils/Animation";
import Typography from "@/ui/components/Typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Stack from "@/ui/components/Stack";
import { Dynamic } from "@/ui/components/Dynamic";
import { NativeHeaderHighlight, NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import { CircularProgress } from "@/ui/components/CircularProgress";
import Calendar from "@/ui/components/Calendar";
import { AlignCenter, Search } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import PatternBackground from "@/ui/components/PatternBackground";
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from "@react-native-masked-view/masked-view";
import { Circle, G, Path } from "react-native-svg";
import AnimatedModalLayout from "@/ui/components/AnimatedModalLayout";
import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import List from "@/ui/components/List";
import Item from "@/ui/components/Item";

const PatternTile = ({ x, y }: { x: number; y: number }) => (
  <G opacity="0.24" transform={`translate(${x}, ${y})`}>
    <Path
      d="M3.2583 -2.20435L8.44284 4.98312M13.6274 12.1706L8.44284 4.98312M15.6303 -0.201414L8.44284 4.98312M1.25537 10.1677L8.44284 4.98312"
      stroke="#9E0086"
      strokeOpacity="0.27"
      strokeWidth={3}
      strokeLinecap="round"
    />
    <Path
      d="M21.1685 22.625L26.353 29.8125M31.5375 36.9999L26.353 29.8125M33.5405 24.6279L26.353 29.8125M19.1655 34.997L26.353 29.8125"
      stroke="#9E0086"
      strokeOpacity="0.27"
      strokeWidth={3}
      strokeLinecap="round"
    />
    <Circle
      cx="29.8125"
      cy="8.44284"
      r="6.26654"
      transform="rotate(9.19595 29.8125 8.44284)"
      stroke="#9E0086"
      strokeOpacity="0.27"
      fill={"transparent"}
      strokeWidth={3}
    />
    <Circle
      cx="4.98312"
      cy="26.353"
      r="6.26654"
      transform="rotate(9.19595 4.98312 26.353)"
      stroke="#9E0086"
      strokeOpacity="0.27"
      strokeWidth={3}
      fill={"transparent"}
    />
  </G>
);

const MemoizedAnimatedModalLayout = React.memo(AnimatedModalLayout);

export default function TabOneScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const colors = theme.colors;

  const [fullyScrolled, setFullyScrolled] = useState(false);

  const handleFullyScrolled = useCallback((isFullyScrolled: boolean) => {
    setFullyScrolled(isFullyScrolled);
  }, []);

  const background = useMemo(() => (
    <MaskedView
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 350
      }}
      maskElement={
        <LinearGradient
          colors={['rgba(247, 232, 245, 0.00)', '#f7e8f5', 'rgba(247, 232, 245, 0.00)']}
          locations={[0.1, 0.5, 0.8]}
          start={{ x: 0.9, y: 0.1 }}
          end={{ x: 0, y: 0.7 }}
          style={{ flex: 1 }}
        />
      }
    >
      <PatternBackground PatternTile={PatternTile} />
    </MaskedView>
  ), []);

  const headerContent = useMemo(() => (
    <>
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
    </>
  ), [colors.text]);

  const modalContent = useMemo(() => (
    <View>
      <List>
        {Array.from({ length: 100 }, (_, i) => (
          <Item key={i}>
            <Typography variant="body1" color="text">
              Tâche {i + 1}
            </Typography>
          </Item>
        ))}
      </List>
    </View>
  ), []);

  const onScrollOffsetChange = useCallback(() => { }, []);

  return (
    <>

      <NativeHeaderSide side="Left">
        <NativeHeaderPressable
          onPress={() => {
            console.log("Add new grade pressed");
          }}
        >
          <AlignCenter color={colors.text} />
        </NativeHeaderPressable>
      </NativeHeaderSide>
      <NativeHeaderTitle key={`header-title:` + fullyScrolled}>
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
              <Animated.View
                style={{
                  width: 200,
                  alignItems: 'center',
                }}
                key="tasks-visible" entering={PapillonAppearIn} exiting={PapillonAppearOut}>
                <Typography inline variant={"body2"} style={{ color: "#C54CB3" }}>
                  Encore 3 tâches restantes
                </Typography>
              </Animated.View>
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
      <MemoizedAnimatedModalLayout
        onScrollOffsetChange={onScrollOffsetChange}
        backgroundColor={theme.dark ? "#2e0928" : "#f7e8f5"}
        onFullyScrolled={handleFullyScrolled}
        background={background}
        headerContent={headerContent}
        modalContent={modalContent}
      />
    </>
  );
};