import React, { Children, useEffect, useRef, useState } from "react";
import { Button, StyleSheet, View } from "react-native";

import { Screen } from "@/router/helpers/types";
import { NativeText } from "@/components/Global/NativeComponents";
import InfiniteDatePager from "@/components/Global/InfiniteDatePager";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { AccountService } from "@/stores/account/types";
import { updateTimetableForWeekInCache } from "@/services/timetable";
import { set } from "lodash";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";

import Reanimated, { FadeIn, FadeInDown, FadeInLeft, FadeOut, FadeOutLeft, FadeOutRight, FadeOutUp, LinearTransition, ZoomIn, ZoomOut } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { PressableScale } from "react-native-pressable-scale";
import { useTheme } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ArrowLeftToLine, ArrowUp, CalendarCheck, CalendarClock, CalendarPlus, CalendarSearch, History, ListRestart, Loader, Plus, Rewind } from "lucide-react-native";

interface ModernHeaderProps {
  children: React.ReactNode,
  outsideNav?: boolean,
  height?: number,
  startLocation?: number,
  native? : boolean,
  tint?: string,
};

export const PapillonModernHeader: React.FC<ModernHeaderProps> = (props) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (props.native) {
    return (
      <NativeModernHeader {...props} />
    );
  }

  return (
    <LinearGradientModernHeader {...props} />
  );
};

const LinearGradientModernHeader: React.FC<ModernHeaderProps> = ({ children, outsideNav = false, height = 70, startLocation = 0.5 }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <>
      <LinearGradient
        colors={[theme.colors.background + "EE", theme.colors.background + "00"]}
        locations={[startLocation, 1]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: outsideNav ? height : insets.top + height,
          zIndex: 90,
        }}
      />

      <Reanimated.View
        style={[{
          paddingHorizontal: 16,
          paddingVertical: 8,
          position: "absolute",
          left: 0,
          top: outsideNav ? 24 : insets.top,
          zIndex: 100,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }]}
        layout={animPapillon(LinearTransition)}
      >
        {children}
      </Reanimated.View>

      {outsideNav &&
        <View
          style={{
            position: "absolute",
            top: 10,
            alignSelf: "center",
            height: 5,
            width: 50,
            backgroundColor: theme.colors.text + "22",
            borderRadius: 80,
            zIndex: 10000,
          }}
        />
      }
    </>
  );
};


const NativeModernHeader: React.FC<ModernHeaderProps> = ({ children, outsideNav = false, tint = null }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Reanimated.View
        style={[{
          position: "absolute",
          left: 0,
          zIndex: 100,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          backgroundColor: tint ? tint : theme.colors.text + "10",
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 0.5,
        }]}
        layout={animPapillon(LinearTransition)}
      >
        <BlurView
          experimentalBlurMethod="dimezisBlurView"
          intensity={100}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            paddingTop: (outsideNav ? 24 : insets.top) + 12,
          }}
          tint={theme.dark ? "dark" : "light"}
        >
          {children}
        </BlurView>
      </Reanimated.View>

      {outsideNav &&
        <View
          style={{
            position: "absolute",
            top: 10,
            alignSelf: "center",
            height: 5,
            width: 50,
            backgroundColor: theme.colors.text + "22",
            borderRadius: 80,
            zIndex: 10000,
          }}
        />
      }
    </>
  );
};

export const PapillonHeaderAction: React.FC<{
  onPress?: () => void,
  children?: React.ReactNode,
  icon?: React.ReactNode,
  style?: any,
  animated?: boolean,
  entering?: any,
  exiting?: any,
  iconProps?: any,
}> = ({
  onPress,
  children,
  icon,
  style,
  animated = true,
  entering = animPapillon(FadeIn),
  exiting = animPapillon(FadeOut),
  iconProps,
}) => {
  const theme = useTheme();

  const newIcon = icon && React.cloneElement(icon as any, {
    size: 22,
    strokeWidth: 2.3,
    color: theme.colors.text,
    ...iconProps,
  });

  return (
    <Reanimated.View
      layout={animated && animPapillon(LinearTransition)}
      entering={entering && entering}
      exiting={exiting && exiting}
    >
      <PressableScale
        activeScale={0.85}
        weight="light"
        onPress={onPress}
        style={[{
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background + "ff",
          borderColor: theme.colors.border + "dd",
          borderWidth: 1,
          borderRadius: 800,
          height: 40,
          width: 40,
          minWidth: 40,
          minHeight: 40,
          gap: 4,
          shadowColor: "#00000022",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.6,
          shadowRadius: 4,
        }, style]}
      >
        {newIcon}
        {children}
      </PressableScale>
    </Reanimated.View>
  );
};

export const PapillonHeaderSeparator: React.FC = () => {
  return (
    <Reanimated.View
      layout={animPapillon(LinearTransition)}
      style={{
        flex: 1
      }}
    />
  );
};

export const PapillonHeaderSelector: React.FC<{
  children: React.ReactNode,
  onPress?: () => void,
  onLongPress?: () => void,
  loading?: boolean,
}> = ({
  children,
  onPress,
  onLongPress,
  loading = false,
}) => {
  const theme = useTheme();

  return (
    <Reanimated.View
      layout={animPapillon(LinearTransition)}
    >
      <PressableScale
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <Reanimated.View
          layout={animPapillon(LinearTransition)}
          style={[{
            backgroundColor: theme.colors.text + 16,
            overflow: "hidden",
            borderRadius: 80,
          }]}
        >
          <BlurView
            style={[styles.weekPicker, {
              backgroundColor: "transparent",
            }]}
            tint={theme.dark ? "dark" : "light"}
          >
            {children}

            {loading &&
              <PapillonSpinner
                size={18}
                color={theme.colors.text}
                strokeWidth={2.8}
                entering={animPapillon(ZoomIn)}
                exiting={animPapillon(ZoomOut)}
                style={{
                  marginLeft: 5,
                }}
              />
            }
          </BlurView>
        </Reanimated.View>
      </PressableScale>
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: "absolute",
    top: 0,
    left: 0,
  },

  weekPicker: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 80,
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignSelf: "flex-start",
    overflow: "hidden",
  },

  weekPickerText: {
    zIndex: 10000,
  },

  weekPickerTextIntl: {
    fontSize: 14.5,
    fontFamily: "medium",
    opacity: 0.7,
  },

  weekPickerTextNbr: {
    fontSize: 16.5,
    fontFamily: "semibold",
    marginTop: -1.5,
  },

  weekButton: {
    overflow: "hidden",
    borderRadius: 80,
    height: 38,
    width: 38,
    justifyContent: "center",
    alignItems: "center",
  },
});
