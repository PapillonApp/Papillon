import React, { useState, useRef } from "react";
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
import Stack from "@/ui/components/Stack";
import { Papicons } from "@getpapillon/papicons";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import { warn } from "@/utils/logger/logger";

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
    colorText = textColor;
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Stack direction="horizontal" vAlign="center" style={[styles.item, isOn && styles.itemSelected]}>
        <View style={styles.itemContent}>
          <Text
            style={[
              styles.itemTitle,
              { color: colorText },
              disabled && styles.disabled,
            ]}
            numberOfLines={1}
          >
            {action.title}
          </Text>
          {action.subtitle && (
            <Text
              style={[
                styles.itemSubtitle,
                { color: subtitleColor },
                disabled && styles.disabled,
              ]}
              numberOfLines={2}
            >
              {action.subtitle}
            </Text>
          )}
        </View>
        {hasSubactions && (
          <Papicons name="ChevronRight" color={textColor} size={20} style={styles.arrow} />
        )}
        {isOn && !hasSubactions && (
          <Papicons name="Check" color={primaryColor} size={18} style={styles.check} />
        )}
      </Stack>
    </TouchableOpacity>
  );
}

export default function ActionMenu({
  actions = [],
  children,
  onPressAction,
  title,
}: NativeMenuComponentProps) {
  const handleActionPress = onPressAction ?? (() => { });
  const { colors } = useTheme();
  const subtitleColor = `${colors.text}80`;
  const primaryColor = colors.primary;
  const cardColor = colors.card;
  const destructiveColor = (colors as any).danger;
  const borderColor = colors.border;

  const triggerRef = useRef<View | null>(null);
  const menuRef = useRef<View | null>(null);
  const [visible, setVisible] = useState(false);
  const [submenuStack, setSubmenuStack] = useState<NativeMenuAction[]>([]);
  const [position, setPosition] = useState<LayoutRectangle | null>(null);
  const [menuSize, setMenuSize] = useState<{ width: number; height: number } | null>(null);

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
    setVisible(true);
    setTimeout(() => {
      triggerRef.current?.measureInWindow((x, y, width, height) => {
        setPosition({ x, y, width, height });
      });
    }, 0);
  }

  function close() {
    setVisible(false);
    setSubmenuStack([]);
  }

  function handlePress(action: NativeMenuAction, fallbackId: string) {
    if (action.subactions && action.subactions.length > 0) {
      setSubmenuStack((prev) => [...prev, action]);
      return;
    }
    handleActionPress({ nativeEvent: { event: action.id ?? fallbackId } });
    close();
  }

  function handleBack() {
    setSubmenuStack((prev) => prev.slice(0, -1));
  }

  function getMenuPosition() {
    if (!position || !menuSize) {
      return { alignSelf: "center" as const };
    }

    const screen = Dimensions.get("window");
    const MARGIN = 16;
    const SPACING = 8;

    const left = Math.min(
      Math.max(position.x, MARGIN),
      screen.width - MARGIN - menuSize.width
    );

    const topIfBelow = position.y + position.height + SPACING;
    const hasSpaceBelow = topIfBelow + menuSize.height <= screen.height - MARGIN;
    const top = hasSpaceBelow
      ? topIfBelow
      : Math.max(MARGIN, position.y - menuSize.height - SPACING);

    return { position: "absolute" as const, top, left };
  }

  const currentSubmenu = submenuStack[submenuStack.length - 1];
  const currentActions = currentSubmenu?.subactions ?? actions;

  return (
    <View
      ref={triggerRef}
      collapsable={false}
      onTouchEnd={(e) => {
        if (!visible) {
          e.stopPropagation();
          open();
        }
      }}
    >
      {children}
      <Modal visible={visible} transparent onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close} />
        <View style={styles.container} pointerEvents="box-none">
          <View
            ref={menuRef}
            onLayout={(e: { nativeEvent: { layout: { width: number; height: number } } }) => {
              const { width, height } = e.nativeEvent.layout;
              setMenuSize({ width, height });
            }}
            style={[
              styles.menu,
              getMenuPosition(),
              { backgroundColor: cardColor, width: Math.min(Dimensions.get("window").width * 0.85, 320) },
            ]}
          >
            {currentSubmenu && (
              <TouchableOpacity
                onPress={handleBack}
                style={[
                  styles.header,
                  { borderBottomColor: Platform.OS === "ios" && !runsIOS26 ? borderColor : undefined },
                ]}
              >
                <Stack direction="horizontal" vAlign="center" gap={8}>
                  <Papicons name="ChevronLeft" color={colors.text} size={20} style={styles.headerIcon} />
                  <Text style={[styles.back, { color: colors.text }]}>{currentSubmenu.title}</Text>
                </Stack>
              </TouchableOpacity>
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
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  menu: {
    borderRadius: 14,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  back: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  item: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
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
