import React, { type FunctionComponent, RefAttributes, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

import { useTheme } from "@react-navigation/native";

import Reanimated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  ZoomIn
} from "react-native-reanimated";

import { animPapillon } from "@/utils/ui/animations";
import { PressableScale } from "react-native-pressable-scale";
import { NativeText } from "../Global/NativeComponents";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteParameters } from "@/router/helpers/types";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface WidgetContainerProps {
  widget: React.ForwardRefExoticComponent<WidgetProps & RefAttributes<unknown>>
  navigation?: NativeStackNavigationProp<RouteParameters, keyof RouteParameters>
}

export interface WidgetProps {
  setLoading: (loading: boolean) => void;
  loading: boolean;
  setHidden: (hidden: boolean) => void;
  hidden: boolean;
}

const Widget: React.FC<WidgetContainerProps> = ({ widget: DynamicWidget, navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const widgetRef = useRef<FunctionComponent<WidgetProps> | null>(null);
  const { isOnline } = useOnlineStatus();

  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!isOnline && loading) {
      setLoading(false);
    }
  }, [isOnline, loading]);

  const handlePress = () => {
    const location = (widgetRef.current as any)?.handlePress();
    if (location) {
      navigation?.navigate(location);
    }
  };

  return (
    <Reanimated.View
      layout={LinearTransition}
      style={{
        opacity: hidden ? 0 : 1,
        display: hidden ? "none" : "flex",
      }}
      entering={animPapillon(ZoomIn).withInitialValues({ transform: [{ scale: 0.7 }], opacity: 0 })}
      exiting={FadeOut.duration(150)}
    >
      <PressableScale
        onPress={() => handlePress()}
      >
        <Reanimated.View
          entering={
            FadeIn.springify().mass(1).damping(20).stiffness(300)
          }
          exiting={
            FadeOut
          }
          style={[
            styles.widget,
            {
              backgroundColor: colors.card,
            }
          ]}
        >
          {loading && (
            <Reanimated.View
              style={{
                ...StyleSheet.absoluteFillObject,
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
                backgroundColor: colors.card + "CC",
                zIndex: 100,
                borderRadius: 17,
                borderCurve: "continuous",
              }}
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(150)}
            >
              <ActivityIndicator />
              <NativeText variant="subtitle">
                Chargement...
              </NativeText>
            </Reanimated.View>
          )}

          <Reanimated.View
            style={[
              styles.widgetContent,
              {
                backgroundColor: theme.dark ? colors.primary + "09" : colors.primary + "11",
                overflow: "hidden",
                opacity: loading ? 0 : 1,
              }
            ]}
          >
            <DynamicWidget
              ref={widgetRef}
              setLoading={setLoading}
              loading={loading}
              setHidden={setHidden}
              hidden={hidden}
            />
          </Reanimated.View>

        </Reanimated.View>
      </PressableScale>
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  widget: {
    width: 200,
    height: 131,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 17,
    borderCurve: "continuous",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  widgetContent: {
    width: "100%",
    height: "100%",
    borderRadius: 17,
    padding: 13,
    borderCurve: "continuous",
  },
});

export default Widget;