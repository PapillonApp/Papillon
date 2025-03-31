import React, { useMemo, memo } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import Reanimated, { FadeIn, FadeOut, LinearTransition, ZoomIn, ZoomOut } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { PressableScale } from "react-native-pressable-scale";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { BlurView } from "expo-blur";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface ModernHeaderProps {
  children: React.ReactNode;
  outsideNav?: boolean;
  height?: number;
  startLocation?: number;
  native?: boolean;
  tint?: string;
}

const NativeModernHeaderComponent: React.FC<ModernHeaderProps> = ({
  children,
  outsideNav = false,
  tint = null
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const paddingTop = useMemo(() => (outsideNav ? 24 : insets.top) + 12, [outsideNav, insets.top]);

  return (
    <>
      <Reanimated.View
        style={[
          styles.nativeHeader,
          {
            backgroundColor: tint ? tint : theme.colors.card + "10",
            borderBottomColor: theme.colors.border,
          }
        ]}
        layout={animPapillon(LinearTransition)}
      >
        <BlurView
          intensity={100}
          style={[styles.blurContent, { paddingTop }]}
          tint={theme.dark ? "dark" : "light"}
        >
          {children}
        </BlurView>
      </Reanimated.View>

      {outsideNav && (
        <View style={[styles.handleIndicator, { backgroundColor: theme.colors.text + "22" }]} />
      )}
    </>
  );
};

export const NativeModernHeader = memo(NativeModernHeaderComponent);

const LinearGradientModernHeaderComponent: React.FC<ModernHeaderProps & { tint?: string }> = ({
  children,
  outsideNav = false,
  height = 70,
  startLocation = 0.5,
  tint = null
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { isExpoGo } = require("@/utils/native/expoGoAlert");
  const { LinearGradient } = require("expo-linear-gradient");
  const { CustomFilterView } = require("react-native-ios-visual-effect-view");

  const headerHeight = useMemo(() => outsideNav ? height : insets.top + height, [outsideNav, height, insets.top]);
  const blurHeight = useMemo(() => headerHeight - 10, [headerHeight]);
  const enableBlur = useMemo(() =>
    Platform.OS === "ios" && !isExpoGo() && parseInt(Platform.Version) >= 18,
  []
  );
  const gradientColors = useMemo(() =>
    tint && tint !== "" ? [tint + "EE", tint + "00"] : [theme.colors.background + "EE", theme.colors.background + "00"],
  [tint, theme.colors.background]
  );
  const windowWidth = useMemo(() => Dimensions.get("window").width, []);

  return (
    <>
      {enableBlur && (
        <CustomFilterView
          style={[
            styles.blurContainer,
            {
              height: blurHeight,
              width: windowWidth,
            }
          ]}
          backgroundLayerSamplingSizeScale={2}
          currentFilters={{
            backgroundFilters: [{
              filterName: "variadicBlur",
              radius: 8,
              shouldNormalizeEdges: true,
              gradientMask: {
                type: "axial",
                colors: ["rgba(0,0,0,1)", "rgba(0,0,0,0)"],
                startPointPreset: "topCenter",
                endPointPreset: "bottomCenter",
                size: { height: blurHeight, width: windowWidth },
              }
            }]
          }}
        />
      )}

      <LinearGradient
        colors={gradientColors}
        locations={[startLocation, 1]}
        style={[
          styles.gradientContainer,
          {
            height: headerHeight,
            opacity: enableBlur ? 0.5 : 1,
          }
        ]}
      />

      <Reanimated.View
        style={[
          styles.headerContent,
          {
            top: outsideNav ? 24 : insets.top,
          }
        ]}
        layout={animPapillon(LinearTransition)}
      >
        {children}
      </Reanimated.View>

      {outsideNav && Platform.OS === "ios" && (
        <View style={[styles.handleIndicator, { backgroundColor: theme.colors.text + "22" }]} />
      )}
    </>
  );
};

export const LinearGradientModernHeader = memo(LinearGradientModernHeaderComponent);

const PapillonModernHeaderComponent: React.FC<ModernHeaderProps> = (props) => {
  const { native } = props;

  if (native) {
    return <NativeModernHeader {...props} />;
  }

  return <LinearGradientModernHeader {...props} tint={props.tint}/>;
};

export const PapillonModernHeader = memo(PapillonModernHeaderComponent);

const PapillonHeaderActionComponent: React.FC<{
  onPress?: () => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  style?: any;
  animated?: boolean;
  entering?: any;
  exiting?: any;
  iconProps?: any;
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

  const newIcon = useMemo(() => {
    if (!icon) return null;
    return React.cloneElement(icon as any, {
      size: 22,
      strokeWidth: 2.3,
      color: theme.colors.text,
      ...iconProps,
    });
  }, [icon, iconProps, theme.colors.text]);

  return (
    <Reanimated.View
      layout={animated && animPapillon(LinearTransition)}
      entering={entering}
      exiting={exiting}
    >
      <PressableScale
        activeScale={0.85}
        weight="light"
        onPress={onPress}
        style={[
          styles.actionButton,
          {
            backgroundColor: theme.colors.background + "ff",
            borderColor: theme.colors.border + "dd",
            shadowColor: "#00000022",
          },
          style
        ]}
      >
        {newIcon}
        {children}
      </PressableScale>
    </Reanimated.View>
  );
};

export const PapillonHeaderAction = memo(PapillonHeaderActionComponent);

const PapillonHeaderSeparatorComponent: React.FC = () => {
  return (
    <Reanimated.View
      layout={animPapillon(LinearTransition)}
      style={styles.separator}
    />
  );
};

export const PapillonHeaderSeparator = memo(PapillonHeaderSeparatorComponent);

const PapillonHeaderSelectorComponent: React.FC<{
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  loading?: boolean;
}> = ({
  children,
  onPress,
  onLongPress,
  loading = false,
}) => {
  const theme = useTheme();
  const isOnline = useOnlineStatus();

  return (
    <Reanimated.View layout={animPapillon(LinearTransition)}>
      <PressableScale onPress={onPress} onLongPress={onLongPress}>
        <Reanimated.View
          layout={animPapillon(LinearTransition)}
          style={[styles.selectorContainer, {
            backgroundColor: theme.colors.text + "16",
          }]}
        >
          <BlurView
            style={styles.selectorContent}
            tint={theme.dark ? "dark" : "light"}
          >
            {children}

            {isOnline && loading && (
              <PapillonSpinner
                size={18}
                color={theme.colors.text}
                strokeWidth={2.8}
                entering={animPapillon(ZoomIn)}
                exiting={animPapillon(ZoomOut)}
                style={styles.spinner}
              />
            )}
          </BlurView>
        </Reanimated.View>
      </PressableScale>
    </Reanimated.View>
  );
};

export const PapillonHeaderSelector = memo(PapillonHeaderSelectorComponent);

const styles = StyleSheet.create({
  blurContainer: {
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 80,
  },
  gradientContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 90,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: "absolute",
    left: 0,
    zIndex: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  handleIndicator: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    height: 5,
    width: 50,
    borderRadius: 80,
    zIndex: 10000,
  },
  nativeHeader: {
    position: "absolute",
    left: 0,
    zIndex: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 0.5,
  },
  blurContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 800,
    height: 40,
    width: 40,
    minWidth: 40,
    minHeight: 40,
    gap: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  separator: {
    flex: 1
  },
  selectorContainer: {
    overflow: "hidden",
    borderRadius: 80,
  },
  selectorContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 80,
    gap: 6,
    backgroundColor: "transparent",
    alignSelf: "flex-start",
    overflow: "hidden",
  },
  spinner: {
    marginLeft: 5,
  },
});