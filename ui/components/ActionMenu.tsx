import React, { ReactNode, useState, useRef, cloneElement, isValidElement } from "react";
import {
  Modal,
  Platform,
  Pressable,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  LayoutRectangle,
} from "react-native";
import { useTheme } from "@react-navigation/native";

let NativeMenuView: any = null;
try {
  NativeMenuView = require("@react-native-menu/menu").MenuView;
} catch {}

interface MenuAction {
  id: string;
  title: string;
  subtitle?: string;
  state?: "on" | "off" | "mixed";
  image?: string;
  imageColor?: string;
  destructive?: boolean;
  disabled?: boolean;
  subactions?: MenuAction[];
  displayInline?: boolean;
}

interface ActionMenuProps {
  actions: MenuAction[];
  children: ReactNode;
  onPressAction: (event: { nativeEvent: { event: string } }) => void;
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
  const isOn = action.state === "on";
  const hasSubactions = action.subactions && action.subactions.length > 0;

  return (
    <TouchableOpacity onPress={onPress} disabled={action.disabled}>
      <View style={[styles.item, isOn && styles.itemSelected]}>
        <View style={styles.itemContent}>
          <Text
            style={[
              styles.itemTitle,
              { color: action.destructive ? "#b71c1c" : textColor },
              action.disabled && styles.disabled,
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
                action.disabled && styles.disabled,
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
      </View>
    </TouchableOpacity>
  );
}

export default function ActionMenu({
  actions = [],
  children,
  onPressAction,
  title,
}: ActionMenuProps) {
  const { colors, dark } = useTheme();
  const textColor = colors.text;
  const subtitleColor = dark ? `${colors.text}80` : `${colors.text}80`;
  const primaryColor = colors.primary;
  const cardColor = colors.card;

  const triggerRef = useRef<View>(null);
  const [visible, setVisible] = useState(false);
  const [submenu, setSubmenu] = useState<MenuAction | null>(null);
  const [position, setPosition] = useState<LayoutRectangle | null>(null);

  // iOS
  if (Platform.OS === "ios" && NativeMenuView) {
    return (
      <NativeMenuView
        onPressAction={onPressAction}
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
    setSubmenu(null);
  }

  function handlePress(action: MenuAction) {
    if (action.subactions && action.subactions.length > 0) {
      setSubmenu(action);
    } else {
      onPressAction({ nativeEvent: { event: action.id } });
      close();
    }
  }

  function getMenuPosition() {
    if (!position) {
      return { alignSelf: "center" as const };
    }
    return {
      position: "absolute" as const,
      top: position.y + position.height + 8,
      left: Math.min(position.x, 100),
    };
  }

  const currentActions = submenu?.subactions ?? actions;

  const trigger = isValidElement(children)
    ? cloneElement(children as React.ReactElement<any>, {
        onPress: () => {
          (children as any).props?.onPress?.();
          open();
        },
      })
    : children;

  return (
    <View ref={triggerRef}>
      {trigger}
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
            {submenu && (
              <TouchableOpacity
                onPress={() => setSubmenu(null)}
                style={styles.header}
              >
                <Text style={[styles.back, { color: textColor }]}>
                  ‹ {submenu.title}
                </Text>
              </TouchableOpacity>
            )}
            {currentActions.map((action) => (
              <MenuItem
                key={action.id}
                action={action}
                textColor={textColor}
                subtitleColor={subtitleColor}
                primaryColor={primaryColor}
                onPress={() => handlePress(action)}
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
    borderBottomColor: "rgba(128,128,128,0.2)",
    marginBottom: 4,
  },
  back: {
    fontSize: 16,
    fontWeight: "600",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
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
