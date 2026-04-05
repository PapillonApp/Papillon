import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import type { ComponentType } from "react";
import type { MenuAction as NativeMenuAction, MenuComponentProps as NativeMenuComponentProps } from "@react-native-menu/menu";
import {
  Modal,
  Platform,
  Pressable,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  LayoutRectangle,
  Dimensions,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Stack from "@/ui/components/Stack";
import { Papicons } from "@getpapillon/papicons";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import { warn } from "@/utils/logger/logger";
import Typography from "../new/Typography";
import Reanimated, { FadeIn, FadeInRight, FadeOut, FadeOutLeft, LayoutAnimationConfig, LinearTransition, useAnimatedStyle, useSharedValue, withSpring, withTiming, ZoomOut, ZoomOutEasyUp } from "react-native-reanimated";
import { PapillonAndroidMenuIn, PapillonAppearIn, PapillonAppearOut, PapillonSpringIn, PapillonZoomIn, PapillonZoomOut } from "../utils/Transition";
import { ListTouchable } from "../new/List";

let NativeMenuView: ComponentType<Record<string, unknown>> | null = null;
if (Platform.OS === "ios") {
  try {
    const mod = require("@react-native-menu/menu");
    NativeMenuView = mod?.MenuView ?? null;
  } catch (err: unknown) {
    warn(`ActionMenu: impossible de charger @react-native-menu/menu MenuView: ${String(err)}`);
  }
}

function MenuItem({
  action,
  textColor,
  subtitleColor,
  primaryColor,
  destructiveColor,
  onPress,
}: {
  action: NativeMenuAction;
  textColor: string;
  subtitleColor: string;
  primaryColor: string;
  destructiveColor: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  // Reduced flags: compute isOn from action.state (attributes does not expose state in the types).
  const isOn = action.state === "on";
  const hasSubactions = Boolean(action.subactions?.length);
  const legacy = action as unknown as { destructive?: boolean; disabled?: boolean };
  const destructive = Boolean(action.attributes?.destructive ?? legacy.destructive);
  const disabled = Boolean(action.attributes?.disabled ?? legacy.disabled);

  let colorText: string;
  if (action.imageColor !== undefined && action.imageColor !== null) {
    colorText = String(action.imageColor);
  } else if (destructive) {
    colorText = destructiveColor;
  } else {
    colorText = theme.colors.text;
  }

  return (
    <View style={styles.itemContainer}>
      <ListTouchable onPress={onPress} disabled={disabled}>
        <Stack direction="horizontal" hAlign="center" vAlign="center" gap={12} style={[styles.item, isOn && {
          backgroundColor: theme.colors.tint + "20",
        }]}>
          {action.papicon ? (
            <Papicons name={action.papicon } color={(isOn && !hasSubactions) ? theme.colors.tint : colorText} size={22} />
          ) : null}
          <View style={styles.itemContent}>
            <Typography
              variant="action"
              weight={"bold"}
              numberOfLines={1}
              color={(isOn && !hasSubactions) ? theme.colors.tint : colorText}
            >
              {action.title}
            </Typography>
            {action.subtitle && (
              <Typography
                variant="body1"
                color={(isOn && !hasSubactions) ? theme.colors.tint : colorText + "80"}
                numberOfLines={2}
              >
                {action.subtitle}
              </Typography>
            )}
          </View>
          {hasSubactions && (
            <Papicons name="ChevronRight" color={colorText} size={20} style={styles.arrow} />
          )}
          {(isOn && !hasSubactions) && (
            <Papicons name="Check" color={theme.colors.tint} size={18} style={styles.check} />
          )}
        </Stack>
      </ListTouchable>
    </View>
  );
}

export default function ActionMenu({
  actions = [],
  children,
  onPressAction,
  title,
  placement = "auto",
}: NativeMenuComponentProps & { placement?: "auto" | "below" }) {
  const handleActionPress = onPressAction ?? (() => { });
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const subtitleColor = `${colors.text}80`;
  const primaryColor = colors.primary;
  const cardColor = colors.card;
  const destructiveColor = (colors as any).danger;
  const borderColor = colors.border;

  const triggerRef = useRef<View | null>(null);
  const menuRef = useRef<View | null>(null);
  const measureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [submenuStack, setSubmenuStack] = useState<NativeMenuAction[]>([]);
  const [position, setPosition] = useState<LayoutRectangle | null>(null);
  const [menuSize, setMenuSize] = useState<{ width: number; height: number } | null>(null);

  function clearTimer(timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    if (!visible) {
      setModalVisible(false);
    }
  }, [visible]);

  useEffect(() => {
    return () => {
      clearTimer(measureTimeoutRef);
      clearTimer(closeTimeoutRef);
      clearTimer(actionCloseTimeoutRef);
    };
  }, []);

  // iOS
  if (Platform.OS === "ios" && NativeMenuView) {
    return (
      <NativeMenuView
        onPressAction={handleActionPress}
        actions={actions}
        title={title}
      >
        {children}
      </NativeMenuView>
    );
  }

  // Android
  function open() {
    clearTimer(closeTimeoutRef);
    clearTimer(actionCloseTimeoutRef);
    clearTimer(measureTimeoutRef);
    if (menuContentHeight.value <= 0) {
      menuContentHeight.value = estimatedMenuContentHeight;
    }
    setVisible(true);
    measureTimeoutRef.current = setTimeout(() => {
      const trigger = triggerRef.current;
      if (!trigger) {
        setModalVisible(true);
        return;
      }
      trigger.measure((x, y, width, height, pageX, pageY) => {
        setPosition({ x: pageX ?? x, y: pageY ?? y, width, height });
        setModalVisible(true);
      });
    }, 0);
  }

  function close() {
    clearTimer(measureTimeoutRef);
    clearTimer(actionCloseTimeoutRef);
    setModalVisible(false);
    clearTimer(closeTimeoutRef);
    closeTimeoutRef.current = setTimeout(() => {
      setVisible(false);
      setSubmenuStack([]);
      setPosition(null);
      setMenuSize(null);
      hasMeasuredMenuContent.current = false;
      menuContentHeight.value = 0;
    }, 220);
  }

  function handlePress(action: NativeMenuAction, fallbackId: string) {
    if (action.subactions && action.subactions.length > 0) {
      setSubmenuStack((prev) => [...prev, action]);
      return;
    }
    handleActionPress({ nativeEvent: { event: action.id ?? fallbackId } });
    clearTimer(actionCloseTimeoutRef);
    actionCloseTimeoutRef.current = setTimeout(() => {
      close();
    }, 30);
  }

  function handleBack() {
    setSubmenuStack((prev) => prev.slice(0, -1));
  }

  function getMenuPosition() {
    if (!position) {
      return { position: "absolute" as const, top: 0, left: 0, opacity: 0 };
    }

    const screen = Dimensions.get("window");
    const MARGIN = 16;
    const SPACING = 8;
    const width = menuSize?.width ?? menuWidth;
    const height = menuSize?.height ?? estimatedMenuHeight;

    const safeLeft = insets.left + MARGIN;
    const safeRight = screen.width - insets.right - MARGIN;
    const safeTop = insets.top + MARGIN;
    const safeBottom = screen.height - insets.bottom - MARGIN;

    const left = Math.min(
      Math.max(position.x, safeLeft),
      safeRight - width
    );

    const topIfBelow = placement === "below"
      ? Math.min(
        Math.max(position.y, safeTop),
        Math.max(safeTop, safeBottom - height)
      )
      : position.y + position.height + SPACING;
    const hasSpaceBelow = placement === "below" || topIfBelow + height <= safeBottom;
    const top = hasSpaceBelow
      ? topIfBelow
      : Math.max(safeTop, position.y - height - SPACING);

    return { position: "absolute" as const, top, left };
  }

  const side = useMemo(() => {
    if (!position) {
      return "left";
    }
    const screen = Dimensions.get("window");
    const centerX = position.x + position.width / 2;
    return centerX < screen.width / 2 ? "left" : "right";
  }, [position]);

  const currentSubmenu = submenuStack[submenuStack.length - 1];
  const currentActions = currentSubmenu?.subactions ?? actions;
  const menuWidth = Math.min(Dimensions.get("window").width * 0.75, 320);
  const estimatedMenuContentHeight = (currentActions.length + (currentSubmenu ? 1 : 0)) * 48;
  const estimatedMenuHeight = estimatedMenuContentHeight + (currentSubmenu ? 52 : 0);
  const menuContentHeight = useSharedValue(estimatedMenuContentHeight);
  const hasMeasuredMenuContent = useRef(false);

  useEffect(() => {
    if (menuContentHeight.value <= 0) {
      menuContentHeight.value = estimatedMenuContentHeight;
    }
  }, [estimatedMenuContentHeight, menuContentHeight]);

  const menuContentAnimatedStyle = useAnimatedStyle(() => ({
    height: menuContentHeight.value,
  }));
  const handleMenuContentLayout = useCallback((e: { nativeEvent: { layout: { height: number } } }) => {
    const nextHeight = Math.ceil(e.nativeEvent.layout.height);
    if (!hasMeasuredMenuContent.current) {
      menuContentHeight.value = nextHeight;
      hasMeasuredMenuContent.current = true;
      return;
    }
    if (Math.abs(menuContentHeight.value - nextHeight) > 0.5) {
      menuContentHeight.value = withSpring(nextHeight, { duration: 180 });
    }
  }, [menuContentHeight]);

  const theme = useTheme();

  return (
    <View
      ref={triggerRef}
      collapsable={false}
      onTouchEnd={(e) => {
        if (!modalVisible) {
          e.stopPropagation();
          open();
        }
      }}
    >
      {children}
      <Modal visible={visible} transparent onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close} />
        {modalVisible && (
          <Reanimated.View
            style={styles.container}
            pointerEvents="box-none"
            key={"action-menu-container:"+(visible ? "visible" : "hidden")}
          >
            <Reanimated.View
              entering={PapillonAndroidMenuIn}
              exiting={FadeOut.duration(200)}
              ref={menuRef}
              onLayout={(e: { nativeEvent: { layout: { width: number; height: number } } }) => {
                const { width, height } = e.nativeEvent.layout;
                setMenuSize({ width, height });
              }}
              style={[
                styles.menu,
                getMenuPosition(),
                {
                  backgroundColor: theme.colors.item,
                  width: menuWidth,
                  transformOrigin: side === "left" ? "top left" : "top right",
                },
              ]}
            >
              <Reanimated.View
                style={[
                  styles.menuContent,
                  { backgroundColor: theme.colors.item },
                  menuContentAnimatedStyle,
                ]}
              >
                <LayoutAnimationConfig skipEntering skipExiting>
                  <Reanimated.View
                    style={[
                      styles.menuContentInner,
                      {
                        backgroundColor: theme.colors.item,
                      }
                    ]}
                    key={"menu:" + (currentSubmenu?.title ?? "root")}
                    onLayout={handleMenuContentLayout}
                    entering={FadeIn.duration(150)}
                    exiting={currentSubmenu && FadeOut.duration(100)}
                  >
                    {currentSubmenu && (
                      <View
                        style={[
                          styles.header,
                          { borderBottomColor: theme.colors.text + "44" },
                        ]}
                      >
                        <ListTouchable
                          onPress={handleBack}
                        >
                          <Stack direction="horizontal" vAlign="start" hAlign="center" gap={12} padding={[0, 2]}>
                            <Papicons name="ArrowLeft" color={colors.text} size={24} style={styles.headerIcon} />
                            <Typography variant="title" weight="bold">{currentSubmenu.title}</Typography>
                          </Stack>
                        </ListTouchable>
                      </View>
                    )}
                    {currentActions.map((action, index) => (
                      <MenuItem
                        key={action.id ?? `action-${submenuStack.length}-${index}`}
                        action={action}
                        textColor={colors.text}
                        subtitleColor={subtitleColor}
                        primaryColor={primaryColor}
                        destructiveColor={destructiveColor}
                        onPress={() => handlePress(action, `action-${submenuStack.length}-${index}`)}
                      />
                    ))}
                  </Reanimated.View>
                </LayoutAnimationConfig>
              </Reanimated.View>
            </Reanimated.View>
          </Reanimated.View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.0)",
  },
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  menu: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
    maxWidth: 250,
  },
  menuContent: {
    overflow: "hidden",
  },
  menuContentInner: {},
  header: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    overflow: "hidden"
  },
  back: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  itemContainer: {
    borderRadius: 0,
    overflow: "hidden",
  },
  item: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 0,
  },
  itemSelected: {
    backgroundColor: "rgba(0,102,204,0.12)",
  },
  itemContent: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 16,
  },
  itemSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  arrow: {
    alignSelf: "center",
    opacity: 0.7,
    marginLeft: 4,
  },
  check: {
    alignSelf: "center",
    marginLeft: 6,
  },
  headerIcon: {
    alignSelf: "center"
  },
  disabled: {
    opacity: 0.4,
  },
});
