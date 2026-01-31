import React, { ReactNode, useState, useRef } from "react";
import type { ComponentType } from "react";
import type { MenuAction as NativeMenuAction, NativeActionEvent } from "@react-native-menu/menu";
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
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";

let NativeMenuView: ComponentType<Record<string, unknown>> | null = null;
if (Platform.OS === "ios") {
  try {
    const mod = require("@react-native-menu/menu");
    NativeMenuView = mod?.MenuView ?? null;
  } catch (err: unknown) {
    console.warn("ActionMenu: impossible de charger @react-native-menu/menu MenuView:", err);
    NativeMenuView = null;
  }
}

type MenuAction = NativeMenuAction;

interface ActionMenuProps {
  actions: MenuAction[];
  children: ReactNode;
  onPressAction?: ({ nativeEvent }: NativeActionEvent) => void;
  title?: string;
}

function MenuItem({
  action,
  textColor,
  subtitleColor,
  primaryColor,
  onPress,
}: {
  action: MenuAction;
  textColor: string;
  subtitleColor: string;
  primaryColor: string;
  onPress: () => void;
}) {
  // Reduced flags: compute isOn from action.state (attributes does not expose state in the types).
  const isOn = action.state === "on";
  const hasSubactions = Boolean(action.subactions?.length);
  const legacy = action as unknown as { destructive?: boolean; disabled?: boolean };
  const destructive = Boolean(action.attributes?.destructive ?? legacy.destructive);
  const disabled = Boolean(action.attributes?.disabled ?? legacy.disabled);

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Stack direction="horizontal" vAlign="center" style={[styles.item, isOn && styles.itemSelected]}>
        <View style={styles.itemContent}>
          <Text
            style={[
              styles.itemTitle,
              { color: destructive ? "#b71c1c" : textColor },
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
          <Text style={[styles.arrow, { color: textColor }]}>›</Text>
        )}
        {isOn && !hasSubactions && (
          <Text style={[styles.check, { color: primaryColor }]}>✓</Text>
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
}: ActionMenuProps) {
  const handleActionPress = onPressAction ?? (() => {});
  const { colors, dark } = useTheme();
  const textColor = colors.text;
  const subtitleColor = dark ? `${colors.text}80` : `${colors.text}80`;
  const primaryColor = colors.primary;
  const cardColor = colors.card;
  const borderColor = colors.border;

  const triggerRef = useRef<View | null>(null);
  const [visible, setVisible] = useState(false);
  const [submenuStack, setSubmenuStack] = useState<MenuAction[]>([]);
  const [position, setPosition] = useState<LayoutRectangle | null>(null);

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

  function handlePress(action: MenuAction, fallbackId: string) {
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
    if (!position) {
      return { alignSelf: "center" as const };
    }

    const { width, height } = Dimensions.get("window");
    const MARGIN = 16;

    //A remplacer
    const MENU_WIDTH = 320;
    const MENU_HEIGHT = 260;

    const left = Math.min(Math.max(position.x, MARGIN), width - MARGIN - MENU_WIDTH);
    const below = position.y + position.height + 8;
    const fitsBelow = below + MENU_HEIGHT <= height - MARGIN;
    const top = fitsBelow ? below : Math.max(MARGIN, position.y - MENU_HEIGHT - 8);

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
            style={[
              styles.menu,
              getMenuPosition(),
              { backgroundColor: cardColor },
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
                <Text style={[styles.back, { color: textColor }]}>
                  ‹ {currentSubmenu.title}
                </Text>
              </TouchableOpacity>
            )}
            {currentActions.map((action, index) => (
              <MenuItem
                key={action.id ?? `action-${submenuStack.length}-${index}`}
                action={action}
                textColor={textColor}
                subtitleColor={subtitleColor}
                primaryColor={primaryColor}
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
    minWidth: 260,
    maxWidth: 320,
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
    fontSize: 22,
    fontWeight: "400",
    opacity: 0.7,
    marginLeft: 4,
  },
  check: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 6,
  },
  disabled: {
    opacity: 0.4,
  },
});
