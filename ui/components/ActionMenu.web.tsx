import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "expo-router/react-navigation";
import { Papicons } from "@getpapillon/papicons";
import Typography from "../new/Typography";

type Action = {
  id?: string;
  title: string;
  subtitle?: string;
  papicon?: string;
  imageColor?: string;
  state?: "on" | "off";
  subactions?: Action[];
  displayInline?: boolean;
  attributes?: {
    destructive?: boolean;
    disabled?: boolean;
    hidden?: boolean;
  };
  destructive?: boolean;
  disabled?: boolean;
};

type ActionEvent = { nativeEvent: { event: string } };

type Props = {
  actions?: Action[];
  children?: React.ReactNode;
  onPressAction?: (event: ActionEvent) => void;
};

/**
 * Desktop/web ActionMenu.
 *
 * The native ActionMenu implementation is not needed on Tauri/Web and can
 * pull native-only code into the web bundle. Keep the web
 * implementation completely React Native/Web so profile, settings and photo
 * menus remain clickable on PC.
 */
export default function ActionMenu({ actions = [], children, onPressAction }: Props) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [stack, setStack] = useState<Action[]>([]);

  const currentActions = useMemo(() => {
    if (stack.length === 0) return actions;
    return stack[stack.length - 1]?.subactions ?? [];
  }, [actions, stack]);

  const close = () => {
    setVisible(false);
    setStack([]);
  };

  const trigger = () => {
    setStack([]);
    setVisible(true);
  };

  const handleAction = (action: Action, index: number) => {
    if (action.attributes?.hidden) return;
    if (action.attributes?.disabled || action.disabled) return;

    if (action.subactions?.length) {
      setStack(prev => [...prev, action]);
      return;
    }

    const id = action.id ?? `action-${index}`;
    onPressAction?.({ nativeEvent: { event: id } });
    close();
  };

  return (
    <>
      <Pressable onPress={trigger} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
        {children}
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          <View
            style={[
              styles.menu,
              {
                backgroundColor: theme.colors.item,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {stack.length > 0 && (
              <Pressable
                onPress={() => setStack(prev => prev.slice(0, -1))}
                style={({ pressed }) => [styles.back, { opacity: pressed ? 0.65 : 1 }]}
              >
                <Papicons name="ArrowLeft" color={theme.colors.text} size={20} />
                <Typography variant="title" weight="bold">
                  {stack[stack.length - 1].title}
                </Typography>
              </Pressable>
            )}

            {currentActions.map((action, index) => {
              if (action.attributes?.hidden) return null;
              const disabled = Boolean(action.attributes?.disabled || action.disabled);
              const destructive = Boolean(action.attributes?.destructive || action.destructive);
              const selected = action.state === "on";
              const color = action.imageColor ?? (destructive ? "#E00000" : theme.colors.text);

              return (
                <Pressable
                  key={action.id ?? `action-${index}`}
                  disabled={disabled}
                  onPress={() => handleAction(action, index)}
                  style={({ pressed }) => [
                    styles.item,
                    {
                      backgroundColor: pressed
                        ? theme.colors.text + "12"
                        : selected
                          ? theme.colors.tint + "18"
                          : "transparent",
                      opacity: disabled ? 0.4 : 1,
                    },
                  ]}
                >
                  {action.papicon ? (
                    <Papicons
                      name={action.papicon as any}
                      color={selected ? theme.colors.tint : color}
                      size={21}
                    />
                  ) : null}
                  <View style={styles.text}>
                    <Typography
                      variant="action"
                      weight="bold"
                      color={selected ? theme.colors.tint : color}
                      numberOfLines={1}
                    >
                      {action.title}
                    </Typography>
                    {action.subtitle ? (
                      <Typography variant="body2" color="textSecondary" numberOfLines={2}>
                        {action.subtitle}
                      </Typography>
                    ) : null}
                  </View>
                  {action.subactions?.length ? (
                    <Papicons name="ChevronRight" color={theme.colors.text + "99"} size={19} />
                  ) : selected ? (
                    <Papicons name="Check" color={theme.colors.tint} size={18} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  menu: {
    width: "92%",
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  back: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#88888833",
  },
  item: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
});
