import {
  Button as ExpoButton,
  Host,
  Image as ExpoImage,
  Label as ExpoLabel,
  Menu as ExpoMenu,
  Picker as ExpoPicker,
  RNHostView,
  Section as ExpoSection,
  Text as ExpoText,
  Toggle as ExpoToggle,
} from "@expo/ui/swift-ui";
import {
  disabled as disabledModifier,
  pickerStyle,
  tag,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "expo-router/react-navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ColorValue,
  Dimensions,
  Image,
  LayoutRectangle,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Reanimated, {
  FadeIn,
  FadeOut,
  LayoutAnimationConfig,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SFSymbol } from "sf-symbols-typescript";

import Stack from "@/ui/components/Stack";

import { ListTouchable } from "../new/List";
import Typography from "../new/Typography";
import { PapillonAndroidMenuIn } from "../utils/Transition";

export type NativeActionEvent = {
  nativeEvent: {
    event: string;
  };
};

export type SelectionMode = "single" | "multiple";

export type MenuAction = {
  id?: string;
  title: string;
  subtitle?: string;
  attributes?: {
    destructive?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    keepsMenuPresented?: boolean;
  };
  state?: "off" | "on" | "mixed";
  selectionMode?: SelectionMode;
  /** SF Symbol name (iOS). */
  image?: string;
  imageColor?: number | ColorValue;
  /** Local image file URI, shown instead of `image`/`papicon` (e.g. an account avatar). */
  imageUri?: string;
  /** Papicons icon name, rendered by the Android menu. */
  papicon?: string;
  subactions?: MenuAction[];
  /** Render subactions inline in a section instead of a nested menu. */
  displayInline?: boolean;
};

export type MenuComponentProps = {
  actions: MenuAction[];
  onPressAction?: (event: NativeActionEvent) => void;
  selectionMode?: SelectionMode;
  children?: React.ReactNode;
};

function renderExpoActions(
  actions: MenuAction[],
  onPress: (id: string) => void,
  selectionMode?: SelectionMode
): React.ReactNode {
  const visibleEntries = actions
    .map((action, index) => ({
      action,
      id: action.id ?? `action-${index}`,
    }))
    .filter(({ action }) => !action.attributes?.hidden);

  const canUseInlinePicker =
    selectionMode === "single" &&
    visibleEntries.length > 0 &&
    visibleEntries.every(
      ({ action }) =>
        (action.state === "on" || action.state === "off") &&
        !action.subactions?.length &&
        !action.subtitle &&
        !action.imageUri &&
        !action.attributes?.destructive &&
        !(action as { destructive?: boolean }).destructive &&
        (action.selectionMode ?? selectionMode) === "single"
    ) &&
    visibleEntries.filter(({ action }) => action.state === "on").length <= 1;

  if (canUseInlinePicker) {
    const selectedEntry = visibleEntries.find(
      ({ action }) => action.state === "on"
    );

    return (
      <ExpoPicker
        label=""
        selection={selectedEntry?.id ?? null}
        onSelectionChange={selection => {
          if (typeof selection === "string") {
            onPress(selection);
          }
        }}
        modifiers={[pickerStyle("inline")]}
      >
        {visibleEntries.map(({ action, id }) => {
          const isDisabled = Boolean(
            action.attributes?.disabled ||
              (action as { disabled?: boolean }).disabled
          );
          const sfSymbol = action.image as SFSymbol | undefined;
          const imageColor =
            action.imageColor !== undefined && action.imageColor !== null
              ? String(action.imageColor)
              : undefined;
          const itemModifiers = [
            tag(id),
            ...(isDisabled ? [disabledModifier(true)] : []),
            ...(imageColor ? [tint(imageColor)] : []),
          ];

          if (sfSymbol) {
            return (
              <ExpoLabel
                key={id}
                title={action.title}
                systemImage={sfSymbol}
                modifiers={itemModifiers}
              />
            );
          }

          return (
            <ExpoText key={id} modifiers={itemModifiers}>
              {action.title}
            </ExpoText>
          );
        })}
      </ExpoPicker>
    );
  }

  return visibleEntries.map(({ action, id }) => {
    const legacy = action as { destructive?: boolean; disabled?: boolean };
    const destructive = Boolean(
      action.attributes?.destructive || legacy.destructive
    );
    const isDisabled = Boolean(
      action.attributes?.disabled || legacy.disabled
    );
    const imageColor =
      action.imageColor !== undefined && action.imageColor !== null
        ? String(action.imageColor)
        : undefined;
    const sfSymbol = action.image as SFSymbol | undefined;
    const effectiveSelectionMode = action.selectionMode ?? selectionMode;

    if (action.subactions && action.subactions.length > 0) {
      if (action.displayInline) {
        return (
          <ExpoSection key={id}>
            {renderExpoActions(
              action.subactions,
              onPress,
              effectiveSelectionMode
            )}
          </ExpoSection>
        );
      }
      return (
        <ExpoMenu key={id} label="">
          {renderExpoActions(
            action.subactions,
            onPress,
            effectiveSelectionMode
          )}
        </ExpoMenu>
      );
    }

    const mods = [...(isDisabled ? [disabledModifier(true)] : [])];

    if (action.state === "on" || action.state === "off") {
      if (action.subtitle || action.imageUri) {
        return (
          <ExpoToggle
            key={id}
            isOn={action.state === "on"}
            onIsOnChange={() => onPress(id)}
            modifiers={imageColor ? [...mods, tint(imageColor)] : mods}
          >
            {action.imageUri ? <ExpoImage uiImage={action.imageUri} /> : null}
            <ExpoText>{action.title}</ExpoText>
            {action.subtitle ? <ExpoText>{action.subtitle}</ExpoText> : null}
          </ExpoToggle>
        );
      }

      if (!sfSymbol && effectiveSelectionMode !== undefined) {
        const selectionSymbol: SFSymbol =
          effectiveSelectionMode === "single"
            ? action.state === "on"
              ? "checkmark.circle.fill"
              : "circle"
            : action.state === "on"
              ? "checkmark.square.fill"
              : "square";

        return (
          <ExpoButton
            key={id}
            label={action.title}
            systemImage={selectionSymbol}
            onPress={() => onPress(id)}
            modifiers={imageColor ? [...mods, tint(imageColor)] : mods}
          />
        );
      }

      return (
        <ExpoToggle
          key={id}
          label={action.title}
          systemImage={sfSymbol}
          isOn={action.state === "on"}
          onIsOnChange={() => onPress(id)}
          modifiers={imageColor ? [...mods, tint(imageColor)] : mods}
        />
      );
    }

    return (
      <ExpoButton
        key={id}
        label={action.title}
        systemImage={sfSymbol}
        role={destructive ? "destructive" : "default"}
        onPress={() => onPress(id)}
        modifiers={imageColor ? [...mods, tint(imageColor)] : mods}
      />
    );
  });
}

function MenuItem({
  action,
  textColor,
  subtitleColor,
  primaryColor,
  destructiveColor,
  selectionMode,
  onPress,
}: {
  action: MenuAction;
  textColor: string;
  subtitleColor: string;
  primaryColor: string;
  destructiveColor: string;
  selectionMode?: SelectionMode;
  onPress: () => void;
}) {
  const theme = useTheme();

  // Reduced flags: compute isOn from action.state (attributes does not expose state in the types).
  const isOn = action.state === "on";
  const hasSelectionState = action.state === "on" || action.state === "off";
  const hasSubactions = Boolean(action.subactions?.length);
  const effectiveSelectionMode = action.selectionMode ?? selectionMode;
  const accentColor =
    (theme.colors as { tint?: string }).tint ?? String(theme.colors.primary);
  const inactiveBorderColor = `${String(theme.colors.text)}66`;
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
          {action.imageUri ? (
            <Image source={{ uri: action.imageUri }} style={styles.itemImage} />
          ) : action.papicon ? (
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
          {hasSelectionState && !hasSubactions && (
            effectiveSelectionMode === "single" ? (
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: isOn ? accentColor : inactiveBorderColor },
                ]}
              >
                {isOn && (
                  <View
                    style={[styles.radioInner, { backgroundColor: accentColor }]}
                  />
                )}
              </View>
            ) : effectiveSelectionMode === "multiple" ? (
              <View
                style={[
                  styles.checkboxOuter,
                  {
                    borderColor: isOn ? accentColor : inactiveBorderColor,
                    backgroundColor: isOn ? accentColor : "transparent",
                  },
                ]}
              >
                {isOn && <Papicons name="Check" color="#FFFFFF" size={12} />}
              </View>
            ) : isOn ? (
              <Papicons
                name="Check"
                color={accentColor}
                size={18}
                style={styles.check}
              />
            ) : null
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
  selectionMode,
  placement = "auto",
}: MenuComponentProps & { placement?: "auto" | "below" }) {
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

  const [submenuStack, setSubmenuStack] = useState<MenuAction[]>([]);
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

  // iOS — native SwiftUI Menu via @expo/ui
  if (Platform.OS === "ios") {
    return (
      <Host matchContents>
        <ExpoMenu
          label={
            <RNHostView matchContents>
              {children as React.ReactElement}
            </RNHostView>
          }
        >
          {renderExpoActions(
            actions,
            id => {
              handleActionPress({ nativeEvent: { event: id } });
            },
            selectionMode
          )}
        </ExpoMenu>
      </Host>
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

  function handlePress(action: MenuAction, fallbackId: string) {
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
                        selectionMode={currentSubmenu?.selectionMode ?? selectionMode}
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
  itemImage: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkboxOuter: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  headerIcon: {
    alignSelf: "center"
  },
  disabled: {
    opacity: 0.4,
  },
});
