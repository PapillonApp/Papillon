import { type ViewStyle, type StyleProp } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";

import Reanimated, { LinearTransition, ZoomIn, ZoomOut } from "react-native-reanimated";
import { PressableScale } from "react-native-pressable-scale";
import { Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import PapillonSpinner from "./PapillonSpinner";
import { animPapillon } from "@/utils/ui/animations";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";

interface CheckboxProps {
  checked?: boolean
  loading?: boolean
  onPress: () => unknown
  style?: StyleProp<ViewStyle>
  color?: string
  loaded?: boolean
}

const PapillonCheckbox: React.FC<CheckboxProps> = ({
  checked,
  loading,
  onPress,
  style,
  color,
  loaded = true
}) => {
  const theme = useTheme();
  const firstRender = useRef(true);
  const { playHaptics } = useSoundHapticsWrapper();

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
    }
  }, []);

  const [hasPressed, setHasPressed] = useState(false);

  const pressAction = () => {
    onPress();

    playHaptics("impact", {
      impact: Haptics.ImpactFeedbackStyle.Light,
    });
    setHasPressed(true);
  };

  // on checked change
  useEffect(() => {
    if (checked && hasPressed && loaded) {
      playHaptics("notification", {
        notification: Haptics.NotificationFeedbackType.Success,
      });
    }
  }, [checked, hasPressed]);

  return (
    <Reanimated.View
      layout={animPapillon(LinearTransition)}
    >
      <PressableScale
        style={[{
          width: 26,
          height: 26,
          borderRadius: 300,
          backgroundColor: theme.colors.text + "00",
          justifyContent: "center",
          alignItems: "center",
        }, style]}
        onPress={pressAction}
        activeScale={0.8}
        weight="light"
      >
        <Reanimated.View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: 300,
            borderColor: theme.colors.text + "22",
            borderWidth: 2,
          }}
        />

        {loading && (
          <Reanimated.View
            entering={ZoomIn.springify().mass(1).damping(20).stiffness(300).delay(100)}
            exiting={ZoomOut.duration(100)}
          >
            <PapillonSpinner size={26} strokeWidth={4} color={color} />
          </Reanimated.View>
        )}

        {checked && !loading &&(
          <Reanimated.View
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 300,
              backgroundColor: color || theme.colors.primary,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 100,
            }}

            entering={loaded ?
              ZoomIn
                .springify()
                .mass(1)
                .damping(20)
                .stiffness(300)
              : void 0}

            exiting={ZoomOut.duration(100)}
          >
            {checked && (
              <Reanimated.View
                entering={loaded ?
                  ZoomIn
                    .springify()
                    .mass(1)
                    .damping(20)
                    .stiffness(300)
                    .delay(100)
                  : void 0}
              >
                <Check
                  size={18}
                  strokeWidth={3.5}
                  color="#fff"
                />
              </Reanimated.View>
            )}
          </Reanimated.View>
        )}
      </PressableScale>
    </Reanimated.View>
  );
};

export default PapillonCheckbox;